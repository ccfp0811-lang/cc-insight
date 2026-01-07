/**
 * 🔥 燃え盛るストリークシステム
 * 
 * メンバーを中毒にさせる「火を絶やすな！」機能
 * 24時間以内の報告で継続、48時間で鎮火（リセット）
 */

import { Timestamp } from "firebase/firestore";

// ストリーク段階の定義
export const STREAK_TIERS = {
  SPARK: {
    name: "継続の種",
    emoji: "🔥",
    minDays: 1,
    maxDays: 6,
    color: "#ef4444", // 通常の赤
    glowColor: "rgba(239, 68, 68, 0.5)",
    description: "火種が生まれました"
  },
  FLAME: {
    name: "習慣の青炎",
    emoji: "💎",
    minDays: 7,
    maxDays: 29,
    color: "#3b82f6", // 青炎
    glowColor: "rgba(59, 130, 246, 0.6)",
    description: "習慣が根付いています"
  },
  INFERNO: {
    name: "守護神の煌めき",
    emoji: "👑",
    minDays: 30,
    maxDays: Infinity,
    color: "#fbbf24", // 黄金
    glowColor: "rgba(251, 191, 36, 0.8)",
    description: "あなたは伝説です"
  }
} as const;

export type StreakTier = keyof typeof STREAK_TIERS;

/**
 * ストリークの段階を取得
 */
export function getStreakTier(currentStreak: number): StreakTier {
  if (currentStreak >= STREAK_TIERS.INFERNO.minDays) return "INFERNO";
  if (currentStreak >= STREAK_TIERS.FLAME.minDays) return "FLAME";
  return "SPARK";
}

/**
 * ストリーク情報を取得
 */
export function getStreakInfo(currentStreak: number) {
  const tier = getStreakTier(currentStreak);
  const tierInfo = STREAK_TIERS[tier];
  
  // 次の段階までの日数
  let daysToNext = 0;
  let nextTier: StreakTier | null = null;
  
  if (tier === "SPARK") {
    daysToNext = STREAK_TIERS.FLAME.minDays - currentStreak;
    nextTier = "FLAME";
  } else if (tier === "FLAME") {
    daysToNext = STREAK_TIERS.INFERNO.minDays - currentStreak;
    nextTier = "INFERNO";
  }
  
  return {
    currentStreak,
    tier,
    tierInfo,
    daysToNext,
    nextTier: nextTier ? STREAK_TIERS[nextTier] : null
  };
}

/**
 * XPボーナス倍率を計算
 * 公式: Bonus = 1.0 + (Streak × 0.05)、最大2.0倍
 */
export function calculateStreakBonus(currentStreak: number): number {
  const bonus = 1.0 + (currentStreak * 0.05);
  return Math.min(bonus, 2.0); // 最大2.0倍
}

/**
 * ストリークを更新すべきか判定
 * 
 * @param lastReportDate 最後の報告日時
 * @param currentDate 現在日時
 * @param includeWeekends 週末を含めるか
 * @returns { shouldUpdate: boolean, shouldReset: boolean, hoursSinceReport: number }
 */
export function shouldUpdateStreak(
  lastReportDate: Date | Timestamp | null,
  currentDate: Date = new Date(),
  includeWeekends: boolean = true
): {
  shouldUpdate: boolean;
  shouldReset: boolean;
  hoursSinceReport: number;
  status: "active" | "warning" | "expired";
} {
  // 初回報告の場合
  if (!lastReportDate) {
    return {
      shouldUpdate: true,
      shouldReset: false,
      hoursSinceReport: 0,
      status: "active"
    };
  }
  
  // Firestoreのタイムスタンプを通常のDateに変換
  const lastDate = lastReportDate instanceof Timestamp 
    ? lastReportDate.toDate() 
    : lastReportDate;
  
  const diffMs = currentDate.getTime() - lastDate.getTime();
  const hoursSince = diffMs / (1000 * 60 * 60);
  
  // 週末スキップロジック（オプション）
  if (!includeWeekends) {
    const dayOfWeek = lastDate.getDay();
    const currentDayOfWeek = currentDate.getDay();
    
    // 金曜報告 → 月曜報告はOK（週末スキップ）
    if (dayOfWeek === 5 && currentDayOfWeek === 1) {
      return {
        shouldUpdate: true,
        shouldReset: false,
        hoursSinceReport: hoursSince,
        status: "active"
      };
    }
  }
  
  // 判定ロジック
  if (hoursSince < 24) {
    // 24時間以内：まだ更新不要（同日扱い）
    return {
      shouldUpdate: false,
      shouldReset: false,
      hoursSinceReport: hoursSince,
      status: "active"
    };
  } else if (hoursSince < 48) {
    // 24-48時間：ストリーク継続（+1）
    return {
      shouldUpdate: true,
      shouldReset: false,
      hoursSinceReport: hoursSince,
      status: hoursSince > 44 ? "warning" : "active" // 44時間超えたら警告
    };
  } else {
    // 48時間以上：鎮火（リセット）
    return {
      shouldUpdate: false,
      shouldReset: true,
      hoursSinceReport: hoursSince,
      status: "expired"
    };
  }
}

/**
 * 損失回避の警告メッセージを生成
 * 20時間経過で警告開始
 */
export function getStreakWarningMessage(
  lastReportDate: Date | Timestamp | null,
  currentStreak: number
): { shouldWarn: boolean; message: string; urgency: "info" | "warning" | "critical" } | null {
  if (!lastReportDate) return null;
  
  const lastDate = lastReportDate instanceof Timestamp 
    ? lastReportDate.toDate() 
    : lastReportDate;
  
  const diffMs = new Date().getTime() - lastDate.getTime();
  const hoursSince = diffMs / (1000 * 60 * 60);
  const hoursRemaining = 48 - hoursSince;
  
  if (hoursSince < 20) {
    // 20時間未満：警告不要
    return null;
  }
  
  if (hoursSince >= 20 && hoursSince < 36) {
    // 20-36時間：情報レベル
    return {
      shouldWarn: true,
      message: `🔥 ${currentStreak}日連続記録を守ろう！ あと${Math.floor(hoursRemaining)}時間以内に報告してください。`,
      urgency: "info"
    };
  }
  
  if (hoursSince >= 36 && hoursSince < 44) {
    // 36-44時間：警告レベル
    return {
      shouldWarn: true,
      message: `⚠️ ストリークが消滅するまであと${Math.floor(hoursRemaining)}時間です！ ${currentStreak}日の努力を無駄にしないで！`,
      urgency: "warning"
    };
  }
  
  // 44時間以上：クリティカル
  return {
    shouldWarn: true,
    message: `🚨 緊急！あと${Math.floor(hoursRemaining)}時間で${currentStreak}日連続記録が消滅します！今すぐ報告してください！`,
    urgency: "critical"
  };
}

/**
 * 祝福メッセージを生成（段階に応じた演出）
 */
export function getStreakCelebrationMessage(
  newStreak: number,
  isNewRecord: boolean
): {
  title: string;
  message: string;
  emoji: string;
  color: string;
} {
  const tierInfo = getStreakInfo(newStreak);
  
  // 新記録達成
  if (isNewRecord && newStreak > 1) {
    return {
      title: "🎉 新記録達成！",
      message: `${newStreak}日連続報告の新記録です！素晴らしい継続力です！`,
      emoji: "🏆",
      color: "#fbbf24"
    };
  }
  
  // マイルストーン達成
  if (newStreak === 7) {
    return {
      title: "💎 習慣の青炎に到達！",
      message: "1週間の継続達成！習慣が根付き始めました。",
      emoji: "💎",
      color: "#3b82f6"
    };
  }
  
  if (newStreak === 30) {
    return {
      title: "👑 守護神の煌めき獲得！",
      message: "30日連続達成！あなたは伝説のメンバーです！",
      emoji: "👑",
      color: "#fbbf24"
    };
  }
  
  if (newStreak === 50) {
    return {
      title: "✨ 不屈の意志！",
      message: "50日連続達成！誰も到達できない領域へ！",
      emoji: "✨",
      color: "#a855f7"
    };
  }
  
  if (newStreak === 100) {
    return {
      title: "🌟 伝説の100日達成！",
      message: "100日連続報告！あなたは生きる伝説です！",
      emoji: "🌟",
      color: "#ec4899"
    };
  }
  
  // 通常の継続
  const { daysToNext, nextTier } = tierInfo;
  if (nextTier && daysToNext > 0) {
    return {
      title: `🔥 ${newStreak}日連続達成！`,
      message: `${nextTier.name}まであと${daysToNext}日！`,
      emoji: tierInfo.tierInfo.emoji,
      color: tierInfo.tierInfo.color
    };
  }
  
  return {
    title: `${tierInfo.tierInfo.emoji} ${newStreak}日連続達成！`,
    message: `${tierInfo.tierInfo.description}`,
    emoji: tierInfo.tierInfo.emoji,
    color: tierInfo.tierInfo.color
  };
}

/**
 * ストリークの炎アイコンコンポーネント用のデータを取得
 */
export function getStreakFlameData(currentStreak: number) {
  const tierInfo = getStreakInfo(currentStreak);
  
  return {
    streak: currentStreak,
    tier: tierInfo.tier,
    emoji: tierInfo.tierInfo.emoji,
    color: tierInfo.tierInfo.color,
    glowColor: tierInfo.tierInfo.glowColor,
    shouldAnimate: tierInfo.tier === "INFERNO", // 30日以上でアニメーション
    tierName: tierInfo.tierInfo.name
  };
}
