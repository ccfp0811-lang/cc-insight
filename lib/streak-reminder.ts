/**
 * ストリークリマインダーシステム
 * 「明日でティアが上がる」期待と「今やめると全てを失う」恐怖を煽る
 * 情緒的で緊迫感のある通知ロジック
 */

import { getDailyLoginData } from "./daily-login-bonus";

export interface StreakReminderData {
  shouldShow: boolean;
  urgency: "info" | "warning" | "critical" | "milestone";
  title: string;
  message: string;
  emoji: string;
  color: string;
  hoursRemaining: number;
  consecutiveDays: number;
  nextTier?: string;
  daysUntilNextTier?: number;
}

/**
 * ストリーク状態をチェックしてリマインダーを生成
 */
export async function getStreakReminder(userId: string): Promise<StreakReminderData | null> {
  try {
    const loginData = await getDailyLoginData(userId);
    
    if (!loginData) {
      return null; // 初回ログイン
    }

    const now = new Date();
    const lastLoginDate = new Date(loginData.lastLoginDate);
    const hoursSinceLogin = (now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60);

    // 本日既にログイン済みの場合
    if (hoursSinceLogin < 24) {
      // マイルストーン到達の祝福
      if (loginData.consecutiveDays === 6) {
        return {
          shouldShow: true,
          urgency: "milestone",
          title: "明日で習慣化達成！",
          message: "7日連続まであと1日。習慣化ボーナスを手に入れよう！",
          emoji: "🥈",
          color: "#94a3b8",
          hoursRemaining: 24 - hoursSinceLogin,
          consecutiveDays: loginData.consecutiveDays,
          nextTier: "習慣化",
          daysUntilNextTier: 1,
        };
      }

      if (loginData.consecutiveDays === 29) {
        return {
          shouldShow: true,
          urgency: "milestone",
          title: "明日で熟練者達成！",
          message: "30日連続まであと1日。伝説の領域へようこそ！",
          emoji: "🥇",
          color: "#fbbf24",
          hoursRemaining: 24 - hoursSinceLogin,
          consecutiveDays: loginData.consecutiveDays,
          nextTier: "熟練者",
          daysUntilNextTier: 1,
        };
      }

      if (loginData.consecutiveDays === 99) {
        return {
          shouldShow: true,
          urgency: "milestone",
          title: "明日で達人達成！",
          message: "100日連続まであと1日。この瞬間のために積み重ねてきた...！",
          emoji: "💎",
          color: "#a855f7",
          hoursRemaining: 24 - hoursSinceLogin,
          consecutiveDays: loginData.consecutiveDays,
          nextTier: "達人",
          daysUntilNextTier: 1,
        };
      }

      if (loginData.consecutiveDays === 364) {
        return {
          shouldShow: true,
          urgency: "milestone",
          title: "明日で伝説達成！",
          message: "365日連続まであと1日。神話への到達、目前...！",
          emoji: "👑",
          color: "#22d3ee",
          hoursRemaining: 24 - hoursSinceLogin,
          consecutiveDays: loginData.consecutiveDays,
          nextTier: "伝説",
          daysUntilNextTier: 1,
        };
      }

      return null; // 通常時は表示しない
    }

    // 20時間～24時間（info: 穏やかな注意喚起）
    if (hoursSinceLogin >= 20 && hoursSinceLogin < 22) {
      return {
        shouldShow: true,
        urgency: "info",
        title: "そろそろログインの時間だ",
        message: `${loginData.consecutiveDays}日連続のストリーク継続中。明日も一緒に歩もう。`,
        emoji: "🌙",
        color: "#60a5fa",
        hoursRemaining: 48 - hoursSinceLogin,
        consecutiveDays: loginData.consecutiveDays,
      };
    }

    // 22時間～40時間（warning: 損失回避の強調）
    if (hoursSinceLogin >= 22 && hoursSinceLogin < 40) {
      const hoursLeft = Math.floor(48 - hoursSinceLogin);
      return {
        shouldShow: true,
        urgency: "warning",
        title: "ストリークが危険な状態に",
        message: `${loginData.consecutiveDays}日間の努力が失われる前に...あと${hoursLeft}時間。`,
        emoji: "⚠️",
        color: "#f59e0b",
        hoursRemaining: 48 - hoursSinceLogin,
        consecutiveDays: loginData.consecutiveDays,
      };
    }

    // 40時間～48時間（critical: 最後の警告）
    if (hoursSinceLogin >= 40 && hoursSinceLogin < 48) {
      const hoursLeft = Math.floor(48 - hoursSinceLogin);
      return {
        shouldShow: true,
        urgency: "critical",
        title: "最後のチャンス！",
        message: `${loginData.consecutiveDays}日連続のストリークが鎮火寸前。あと${hoursLeft}時間...！`,
        emoji: "🚨",
        color: "#ef4444",
        hoursRemaining: 48 - hoursSinceLogin,
        consecutiveDays: loginData.consecutiveDays,
      };
    }

    // 48時間以上（ストリーク途切れ）
    if (hoursSinceLogin >= 48) {
      return {
        shouldShow: true,
        urgency: "critical",
        title: "ストリークが途切れました",
        message: "だが、過去は過去だ。今から再び歩み始めよう。",
        emoji: "🌱",
        color: "#10b981",
        hoursRemaining: 0,
        consecutiveDays: 0,
      };
    }

    return null;
  } catch (error) {
    console.error("ストリークリマインダーエラー:", error);
    return null;
  }
}

/**
 * マイルストーン到達の祝福メッセージ
 */
export function getMilestoneMessage(consecutiveDays: number): string | null {
  const milestones: Record<number, string> = {
    7: "🥈 7日連続達成！習慣の炎が燃え上がり始めた！",
    14: "💎 2週間連続！お前の意志は揺るぎない！",
    30: "🥇 30日連続達成！伝説の領域へようこそ！",
    50: "⚡ 50日連続...もはや誰も止められない！",
    100: "💎 100日連続達成！達人の境地だ！",
    365: "👑 365日連続達成！神話の世界へ...！",
  };

  return milestones[consecutiveDays] || null;
}

/**
 * 次のマイルストーンまでの日数
 */
export function getDaysUntilNextMilestone(consecutiveDays: number): { days: number; milestone: string } | null {
  if (consecutiveDays < 7) {
    return { days: 7 - consecutiveDays, milestone: "習慣化（7日）" };
  }
  if (consecutiveDays < 30) {
    return { days: 30 - consecutiveDays, milestone: "熟練者（30日）" };
  }
  if (consecutiveDays < 100) {
    return { days: 100 - consecutiveDays, milestone: "達人（100日）" };
  }
  if (consecutiveDays < 365) {
    return { days: 365 - consecutiveDays, milestone: "伝説（365日）" };
  }
  return null; // 既に最高到達
}
