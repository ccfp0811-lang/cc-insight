/**
 * 🎯 統合データ取得システム (Unified Data Layer)
 * 
 * 目的: マイページ、ランキング、詳細モーダルの全画面で表示される数値が、
 *       1の位まで完璧に一致する状態を構築する。
 * 
 * 原則: Single Source of Truth（真実の単一ソース）
 * 
 * 作成日: 2026/01/08
 * 作成者: AI Assistant (Cline) + 菅原副社長
 */

import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  doc,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  calculateTotalEnergy,
  calculateKPIScore,
  KPIData 
} from "./energy-economy";
import {
  UserGuardianProfile
} from "./guardian-collection";
import {
  getUserGuardianProfile
} from "./firestore";
import {
  calculateStreakBonus,
  getStreakTier
} from "./streak-system";

// =====================================
// 型定義（完全な型安全性を保証）
// =====================================

/**
 * 統合ユーザーデータ
 * 全画面で表示される数値の完全な集合
 */
export interface UnifiedUserData {
  // 基本情報
  userId: string;
  displayName: string;
  realName: string;
  email: string;
  team: string;
  teamName: string;
  teamColor: string;
  
  // 守護神情報
  guardianProfile: UserGuardianProfile | null;
  activeGuardianId: string | null;
  activeGuardianName: string | null;
  activeGuardianStage: number;
  activeGuardianStageName: string;
  
  // エナジー情報（最重要: 1の位まで一致）
  currentEnergy: number;           // 現在の保有エナジー
  totalEarnedEnergy: number;       // 累計獲得エナジー
  investedEnergy: number;          // 守護神への投資済みエナジー
  
  // ストリーク情報
  currentStreak: number;           // 現在の連続日数
  maxStreak: number;               // 最大連続日数
  streakTier: 'SPARK' | 'FLAME' | 'INFERNO';
  streakMultiplier: number;        // ストリーク倍率（1.0～2.0）
  
  // KPI統計（期間指定可能）
  kpi: {
    // Shorts系
    totalViews: number;            // 総再生数
    totalImpressions: number;      // 総インプレッション
    totalProfileAccess: number;    // 総プロフィールアクセス
    totalFollowerGrowth: number;   // 総フォロワー増加数
    totalInteractions: number;     // 総インタラクション数
    
    // X系
    totalLikes: number;            // 総いいね回り数
    totalReplies: number;          // 総リプライ回り数
    totalPosts: number;            // 総投稿数
    
    // 共通
    totalReports: number;          // 総レポート数
    averageKPIScore: number;       // 平均KPIスコア
    lastReportDate: string | null; // 最終報告日
  };
  
  // ランキング情報
  ranking: {
    overall: number | null;        // 全体順位
    team: number | null;           // チーム内順位
    percentile: number;            // パーセンタイル（上位○%）
  };
  
  // メタ情報
  createdAt: Timestamp;
  lastLoginAt: Timestamp | null;
  status: 'pending' | 'approved' | 'suspended';
}

/**
 * 統合ランキングデータ
 * ランキング画面で表示される全メンバーのデータ
 */
export interface UnifiedRankingData {
  period: 'week' | 'month';        // 集計期間
  startDate: string;               // 開始日
  endDate: string;                 // 終了日
  members: UnifiedUserData[];      // 全メンバーのデータ
  teamStats: {
    [teamId: string]: {
      totalEnergy: number;         // チーム合計エナジー
      averageEnergy: number;       // チーム平均エナジー
      memberCount: number;         // メンバー数
      totalViews: number;          // チーム合計再生数
      totalPosts: number;          // チーム合計投稿数
    };
  };
}

/**
 * レポートデータ（Firestoreスキーマ）
 */
interface Report {
  id: string;
  userId: string;
  userEmail: string;
  name: string;
  team: string;
  teamType: 'shorts' | 'x';
  date: string;
  createdAt: Timestamp;
  
  // Shorts系
  igViews?: number;
  igProfileAccess?: number;
  igExternalTaps?: number;
  igInteractions?: number;
  weeklyStories?: number;
  igFollowers?: number;           // ✅ 差分値（前回比の増分）
  ytFollowers?: number;           // ✅ 差分値
  tiktokFollowers?: number;       // ✅ 差分値
  igPosts?: number;
  ytPosts?: number;
  tiktokPosts?: number;
  
  // X系
  postCount?: number;
  postUrls?: string[];
  likeCount?: number;
  replyCount?: number;
  xFollowers?: number;            // ✅ 差分値
  
  todayComment?: string;
}

// =====================================
// ヘルパー関数
// =====================================

/**
 * チーム情報を取得
 */
const TEAMS = [
  { id: "fukugyou", name: "副業チーム", color: "#ec4899", type: "shorts" as const },
  { id: "taishoku", name: "退職サポートチーム", color: "#06b6d4", type: "shorts" as const },
  { id: "buppan", name: "スマホ物販チーム", color: "#eab308", type: "x" as const },
];

function getTeamInfo(teamId: string) {
  return TEAMS.find(t => t.id === teamId) || TEAMS[0];
}

/**
 * 進化段階名を取得
 */
function getStageName(stage: number): string {
  const names = ["卵", "幼体", "成長体", "成熟体", "究極体"];
  return names[stage] || "不明";
}

/**
 * 期間の計算
 */
function getDateRange(period: 'week' | 'month'): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  
  const start = new Date(now);
  if (period === 'week') {
    start.setDate(now.getDate() - 7);
  } else {
    start.setMonth(now.getMonth() - 1);
  }
  start.setHours(0, 0, 0, 0);
  
  return { start, end };
}

// =====================================
// メイン関数: getUnifiedUserData
// =====================================

/**
 * 統合ユーザーデータを取得
 * 
 * この関数が返すデータは、マイページ、ランキング、詳細モーダルの
 * 全画面で使用され、1の位まで完璧に一致することを保証する。
 * 
 * @param userId ユーザーID
 * @param period 集計期間（'week' | 'month' | 'all'）
 * @returns 統合ユーザーデータ
 */
export async function getUnifiedUserData(
  userId: string,
  period: 'week' | 'month' | 'all' = 'week'
): Promise<UnifiedUserData | null> {
  try {
    // 1. ユーザー基本情報を取得
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists()) {
      console.error(`User not found: ${userId}`);
      return null;
    }
    
    const userData = userDoc.data();
    const teamInfo = getTeamInfo(userData.team);
    
    // 2. 守護神プロファイルを取得
    const guardianProfile = await getUserGuardianProfile(userId);
    
    let activeGuardianId: string | null = null;
    let activeGuardianName: string | null = null;
    let activeGuardianStage = 0;
    let activeGuardianStageName = "なし";
    
    if (guardianProfile && guardianProfile.activeGuardianId) {
      activeGuardianId = guardianProfile.activeGuardianId;
      const guardian = guardianProfile.guardians[activeGuardianId as keyof typeof guardianProfile.guardians];
      if (guardian) {
        const { GUARDIANS } = await import("./guardian-collection");
        const guardianDef = GUARDIANS[activeGuardianId as keyof typeof GUARDIANS];
        activeGuardianName = guardianDef?.name || null;
        activeGuardianStage = guardian.stage;
        activeGuardianStageName = getStageName(guardian.stage);
      }
    }
    
    // 3. レポートデータを取得（期間指定）
    let reportsQuery;
    if (period === 'all') {
      reportsQuery = query(
        collection(db, "reports"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
    } else {
      const { start, end } = getDateRange(period);
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      
      reportsQuery = query(
        collection(db, "reports"),
        where("userId", "==", userId),
        where("date", ">=", startStr),
        where("date", "<=", endStr),
        orderBy("date", "desc")
      );
    }
    
    const reportsSnapshot = await getDocs(reportsQuery);
    const reports: Report[] = [];
    reportsSnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });
    
    // 4. KPI統計を計算
    let totalViews = 0;
    let totalImpressions = 0;
    let totalProfileAccess = 0;
    let totalFollowerGrowth = 0;
    let totalInteractions = 0;
    let totalLikes = 0;
    let totalReplies = 0;
    let totalPosts = 0;
    
    reports.forEach(report => {
      if (report.teamType === 'shorts') {
        totalViews += report.igViews || 0;
        totalImpressions += report.igProfileAccess || 0;
        totalProfileAccess += report.igProfileAccess || 0;
        totalInteractions += report.igInteractions || 0;
        // ✅ followerGrowthは既に差分値として保存されている
        totalFollowerGrowth += (report.igFollowers || 0) + (report.ytFollowers || 0) + (report.tiktokFollowers || 0);
        totalPosts += (report.igPosts || 0) + (report.ytPosts || 0) + (report.tiktokPosts || 0);
      } else {
        totalLikes += report.likeCount || 0;
        totalReplies += report.replyCount || 0;
        totalPosts += report.postCount || 0;
        // ✅ xFollowersも差分値
        totalFollowerGrowth += report.xFollowers || 0;
      }
    });
    
    const totalReports = reports.length;
    const lastReportDate = reports.length > 0 ? reports[0].date : null;
    
    // 5. 平均KPIスコアを計算（エナジー計算と同じロジック）
    const averageKPIScore = totalReports > 0
      ? reports.reduce((sum, report) => {
          const kpi: KPIData = report.teamType === 'shorts' ? {
            type: 'shorts',
            impressions: report.igProfileAccess || 0,
            profileAccess: report.igProfileAccess || 0,
            followerGrowth: (report.igFollowers || 0) + (report.ytFollowers || 0) + (report.tiktokFollowers || 0),
            interactions: report.igInteractions || 0,
          } : {
            type: 'x',
            likes: report.likeCount || 0,
            replies: report.replyCount || 0,
            posts: report.postCount || 0,
          };
          return sum + calculateKPIScore(kpi);
        }, 0) / totalReports
      : 0;
    
    // 6. エナジー情報を取得
    const currentEnergy = guardianProfile?.energy.current || 0;
    // ⚠️ 注: guardian-collectionの型定義に応じて調整が必要
    const totalEarnedEnergy = currentEnergy; // 暫定: currentを累積エナジーとして扱う
    
    let investedEnergy = 0;
    if (guardianProfile && activeGuardianId) {
      const guardian = guardianProfile.guardians[activeGuardianId as keyof typeof guardianProfile.guardians];
      if (guardian) {
        investedEnergy = guardian.investedEnergy || 0;
      }
    }
    
    // 7. ストリーク情報を取得
    const currentStreak = guardianProfile?.streak.current || 0;
    const maxStreak = guardianProfile?.streak.max || 0;
    const streakTierResult = getStreakTier(currentStreak);
    const streakTierValue: 'SPARK' | 'FLAME' | 'INFERNO' = typeof streakTierResult === 'string' ? streakTierResult as any : (streakTierResult as any).tier;
    const streakMultiplier = calculateStreakBonus(currentStreak);
    
    // 8. ランキング情報を計算（後で実装）
    const ranking = {
      overall: null,
      team: null,
      percentile: 0
    };
    
    // 9. 統合データを返却
    const unifiedData: UnifiedUserData = {
      // 基本情報
      userId,
      displayName: userData.displayName || "名前未設定",
      realName: userData.realName || userData.displayName || "名前未設定",
      email: userData.email || "メールアドレス未設定",
      team: userData.team,
      teamName: teamInfo.name,
      teamColor: teamInfo.color,
      
      // 守護神情報
      guardianProfile,
      activeGuardianId,
      activeGuardianName,
      activeGuardianStage,
      activeGuardianStageName,
      
      // エナジー情報
      currentEnergy,
      totalEarnedEnergy,
      investedEnergy,
      
      // ストリーク情報
      currentStreak,
      maxStreak,
      streakTier: streakTierValue,
      streakMultiplier,
      
      // KPI統計
      kpi: {
        totalViews,
        totalImpressions,
        totalProfileAccess,
        totalFollowerGrowth,
        totalInteractions,
        totalLikes,
        totalReplies,
        totalPosts,
        totalReports,
        averageKPIScore,
        lastReportDate
      },
      
      // ランキング情報
      ranking,
      
      // メタ情報
      createdAt: userData.createdAt || Timestamp.now(),
      lastLoginAt: userData.lastLoginAt || null,
      status: userData.status || 'pending'
    };
    
    return unifiedData;
    
  } catch (error) {
    console.error("Error in getUnifiedUserData:", error);
    return null;
  }
}

// =====================================
// メイン関数: getUnifiedRankingData
// =====================================

/**
 * 統合ランキングデータを取得
 * 
 * この関数が返すデータは、ランキング画面で使用され、
 * 全メンバーの数値が1の位まで完璧に一致することを保証する。
 * 
 * @param period 集計期間（'week' | 'month'）
 * @param teamId チームID（オプション）
 * @returns 統合ランキングデータ
 */
export async function getUnifiedRankingData(
  period: 'week' | 'month' = 'week',
  teamId?: string
): Promise<UnifiedRankingData | null> {
  try {
    const { start, end } = getDateRange(period);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    
    // 1. 全ユーザーを取得
    let usersQuery = query(
      collection(db, "users"),
      where("status", "==", "approved")
    );
    
    if (teamId) {
      usersQuery = query(
        collection(db, "users"),
        where("status", "==", "approved"),
        where("team", "==", teamId)
      );
    }
    
    const usersSnapshot = await getDocs(usersQuery);
    const userIds: string[] = [];
    usersSnapshot.forEach((doc) => {
      userIds.push(doc.id);
    });
    
    // 2. 各ユーザーの統合データを取得
    const memberDataPromises = userIds.map(uid => getUnifiedUserData(uid, period));
    const memberDataResults = await Promise.all(memberDataPromises);
    const members = memberDataResults.filter(m => m !== null) as UnifiedUserData[];
    
    // 3. エナジーでソート
    members.sort((a, b) => b.totalEarnedEnergy - a.totalEarnedEnergy);
    
    // 4. ランキング情報を更新
    members.forEach((member, index) => {
      member.ranking.overall = index + 1;
      member.ranking.percentile = ((index + 1) / members.length) * 100;
    });
    
    // 5. チーム別統計を計算
    const teamStats: { [teamId: string]: any } = {};
    
    TEAMS.forEach(team => {
      const teamMembers = members.filter(m => m.team === team.id);
      
      if (teamMembers.length > 0) {
        const totalEnergy = teamMembers.reduce((sum, m) => sum + m.totalEarnedEnergy, 0);
        const totalViews = teamMembers.reduce((sum, m) => sum + m.kpi.totalViews, 0);
        const totalPosts = teamMembers.reduce((sum, m) => sum + m.kpi.totalPosts, 0);
        
        teamStats[team.id] = {
          totalEnergy,
          averageEnergy: Math.floor(totalEnergy / teamMembers.length),
          memberCount: teamMembers.length,
          totalViews,
          totalPosts
        };
        
        // チーム内順位を更新
        teamMembers.forEach((member, index) => {
          member.ranking.team = index + 1;
        });
      }
    });
    
    // 6. 統合ランキングデータを返却
    const rankingData: UnifiedRankingData = {
      period,
      startDate: startStr,
      endDate: endStr,
      members,
      teamStats
    };
    
    return rankingData;
    
  } catch (error) {
    console.error("Error in getUnifiedRankingData:", error);
    return null;
  }
}

// =====================================
// ユーティリティ関数
// =====================================

/**
 * 複数ユーザーの統合データを一括取得
 */
export async function getMultipleUnifiedUserData(
  userIds: string[],
  period: 'week' | 'month' | 'all' = 'week'
): Promise<UnifiedUserData[]> {
  const promises = userIds.map(uid => getUnifiedUserData(uid, period));
  const results = await Promise.all(promises);
  return results.filter(r => r !== null) as UnifiedUserData[];
}

/**
 * チーム別統合データを取得
 */
export async function getTeamUnifiedData(
  teamId: string,
  period: 'week' | 'month' | 'all' = 'week'
): Promise<UnifiedUserData[]> {
  const usersQuery = query(
    collection(db, "users"),
    where("team", "==", teamId),
    where("status", "==", "approved")
  );
  
  const usersSnapshot = await getDocs(usersQuery);
  const userIds: string[] = [];
  usersSnapshot.forEach((doc) => {
    userIds.push(doc.id);
  });
  
  return getMultipleUnifiedUserData(userIds, period);
}

/**
 * エナジーランキング取得（簡易版）
 */
export async function getEnergyLeaderboard(
  limit: number = 10,
  period: 'week' | 'month' = 'week'
): Promise<UnifiedUserData[]> {
  const rankingData = await getUnifiedRankingData(period);
  if (!rankingData) return [];
  
  return rankingData.members.slice(0, limit);
}
