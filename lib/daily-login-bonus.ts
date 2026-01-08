/**
 * デイリーログインボーナスシステム
 * 毎日アプリを開くこと自体に価値を与え、損失回避の心理を最大化
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface DailyLoginData {
  userId: string;
  lastLoginDate: string; // YYYY-MM-DD
  consecutiveDays: number; // 連続ログイン日数
  totalLogins: number; // 累計ログイン回数
  lastBonusEnergy: number; // 前回のボーナスエナジー
  bonusHistory: BonusRecord[]; // ボーナス履歴（最新10件）
  nextBonusTier: number; // 次のティア（7日、30日、100日のマイルストーン）
  createdAt: any;
  updatedAt: any;
}

export interface BonusRecord {
  date: string;
  energy: number;
  consecutiveDays: number;
  tier: "normal" | "silver" | "gold" | "platinum" | "diamond";
}

export interface LoginBonusResult {
  isFirstLoginToday: boolean;
  energyEarned: number;
  consecutiveDays: number;
  tier: "normal" | "silver" | "gold" | "platinum" | "diamond";
  message: string;
  nextTierIn: number; // 次のティアまでの日数
  isStreakBroken: boolean; // ストリークが途切れたか
}

/**
 * ボーナスティア定義
 */
const BONUS_TIERS = {
  normal: {
    name: "初心者",
    emoji: "🌱",
    baseEnergy: 5,
    range: [1, 6],
  },
  silver: {
    name: "習慣化",
    emoji: "🥈",
    baseEnergy: 10,
    range: [7, 29],
  },
  gold: {
    name: "熟練者",
    emoji: "🥇",
    baseEnergy: 20,
    range: [30, 99],
  },
  platinum: {
    name: "達人",
    emoji: "💎",
    baseEnergy: 50,
    range: [100, 364],
  },
  diamond: {
    name: "伝説",
    emoji: "👑",
    baseEnergy: 100,
    range: [365, Infinity],
  },
};

/**
 * 今日の日付を取得（YYYY-MM-DD形式）
 */
function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付差分を計算（日単位）
 */
function getDaysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 連続日数からティアを判定
 */
function getTierFromDays(
  days: number
): "normal" | "silver" | "gold" | "platinum" | "diamond" {
  if (days >= 365) return "diamond";
  if (days >= 100) return "platinum";
  if (days >= 30) return "gold";
  if (days >= 7) return "silver";
  return "normal";
}

/**
 * ティアに応じたボーナスエナジーを計算
 */
function calculateBonusEnergy(consecutiveDays: number): number {
  const tier = getTierFromDays(consecutiveDays);
  const config = BONUS_TIERS[tier];
  
  // 基本エナジー + 連続日数ボーナス（日数×0.5、最大50）
  const dayBonus = Math.min(consecutiveDays * 0.5, 50);
  return Math.floor(config.baseEnergy + dayBonus);
}

/**
 * 次のティアまでの日数を計算
 */
function getNextTierDays(consecutiveDays: number): number {
  if (consecutiveDays >= 365) return 0; // 既に最高ティア
  if (consecutiveDays >= 100) return 365 - consecutiveDays;
  if (consecutiveDays >= 30) return 100 - consecutiveDays;
  if (consecutiveDays >= 7) return 30 - consecutiveDays;
  return 7 - consecutiveDays;
}

/**
 * ボーナスメッセージ生成
 */
function generateBonusMessage(result: LoginBonusResult): string {
  const { tier, consecutiveDays, energyEarned, isStreakBroken } = result;
  const config = BONUS_TIERS[tier];

  if (isStreakBroken) {
    return `${config.emoji} 再始動！新たな旅の始まりだ。${energyEarned}エナジー獲得！`;
  }

  if (consecutiveDays === 1) {
    return `${config.emoji} ログインボーナス！${energyEarned}エナジー獲得！`;
  }

  if (consecutiveDays === 7) {
    return `🥈 7日連続達成！習慣化ボーナス！${energyEarned}エナジー獲得！`;
  }

  if (consecutiveDays === 30) {
    return `🥇 30日連続達成！熟練者の証！${energyEarned}エナジー獲得！`;
  }

  if (consecutiveDays === 100) {
    return `💎 100日連続達成！達人の境地！${energyEarned}エナジー獲得！`;
  }

  if (consecutiveDays === 365) {
    return `👑 365日連続達成！伝説の領域！${energyEarned}エナジー獲得！`;
  }

  return `${config.emoji} ${consecutiveDays}日連続！${config.name}ボーナス！${energyEarned}エナジー獲得！`;
}

/**
 * デイリーログインボーナスをチェック＆付与
 */
export async function checkDailyLoginBonus(userId: string): Promise<LoginBonusResult> {
  const today = getTodayString();
  const docRef = doc(db, "dailyLogins", userId);

  try {
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      // 初回ログイン
      const bonusEnergy = calculateBonusEnergy(1);
      const tier = getTierFromDays(1);

      const newData: DailyLoginData = {
        userId,
        lastLoginDate: today,
        consecutiveDays: 1,
        totalLogins: 1,
        lastBonusEnergy: bonusEnergy,
        bonusHistory: [
          {
            date: today,
            energy: bonusEnergy,
            consecutiveDays: 1,
            tier,
          },
        ],
        nextBonusTier: 7,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, newData);

      const result: LoginBonusResult = {
        isFirstLoginToday: true,
        energyEarned: bonusEnergy,
        consecutiveDays: 1,
        tier,
        message: "",
        nextTierIn: 6,
        isStreakBroken: false,
      };

      result.message = generateBonusMessage(result);

      return result;
    }

    // 既存データあり
    const data = docSnap.data() as DailyLoginData;
    const lastLogin = data.lastLoginDate;

    // 今日既にログイン済み
    if (lastLogin === today) {
      return {
        isFirstLoginToday: false,
        energyEarned: 0,
        consecutiveDays: data.consecutiveDays,
        tier: getTierFromDays(data.consecutiveDays),
        message: "本日は既にログイン済みです",
        nextTierIn: getNextTierDays(data.consecutiveDays),
        isStreakBroken: false,
      };
    }

    // 日数差分計算
    const daysDiff = getDaysDifference(lastLogin, today);
    let newConsecutiveDays: number;
    let isStreakBroken = false;

    if (daysDiff === 1) {
      // 連続ログイン継続
      newConsecutiveDays = data.consecutiveDays + 1;
    } else {
      // ストリーク途切れ
      newConsecutiveDays = 1;
      isStreakBroken = true;
    }

    const bonusEnergy = calculateBonusEnergy(newConsecutiveDays);
    const tier = getTierFromDays(newConsecutiveDays);

    // ボーナス履歴更新（最新10件のみ保持）
    const newBonusHistory = [
      {
        date: today,
        energy: bonusEnergy,
        consecutiveDays: newConsecutiveDays,
        tier,
      },
      ...data.bonusHistory.slice(0, 9),
    ];

    // データ更新
    await updateDoc(docRef, {
      lastLoginDate: today,
      consecutiveDays: newConsecutiveDays,
      totalLogins: data.totalLogins + 1,
      lastBonusEnergy: bonusEnergy,
      bonusHistory: newBonusHistory,
      nextBonusTier: getNextTierDays(newConsecutiveDays),
      updatedAt: serverTimestamp(),
    });

    const result: LoginBonusResult = {
      isFirstLoginToday: true,
      energyEarned: bonusEnergy,
      consecutiveDays: newConsecutiveDays,
      tier,
      message: "",
      nextTierIn: getNextTierDays(newConsecutiveDays),
      isStreakBroken,
    };

    result.message = generateBonusMessage(result);

    return result;
  } catch (error) {
    console.error("デイリーログインボーナスエラー:", error);
    throw error;
  }
}

/**
 * ログインデータ取得
 */
export async function getDailyLoginData(userId: string): Promise<DailyLoginData | null> {
  try {
    const docRef = doc(db, "dailyLogins", userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return docSnap.data() as DailyLoginData;
  } catch (error) {
    console.error("ログインデータ取得エラー:", error);
    return null;
  }
}

/**
 * ユーザーの守護神プロフィールにエナジーを追加
 */
export async function addLoginBonusToProfile(userId: string, energy: number): Promise<void> {
  try {
    const profileRef = doc(db, "guardianProfiles", userId);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists()) {
      const currentEnergy = profileSnap.data().totalEnergy || 0;
      await updateDoc(profileRef, {
        totalEnergy: currentEnergy + energy,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("エナジー追加エラー:", error);
    throw error;
  }
}
