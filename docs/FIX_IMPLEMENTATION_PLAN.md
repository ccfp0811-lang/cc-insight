# 🔧 100点の真実への実装計画書

**作成日**: 2026/01/08  
**期限**: 2026/01/10  
**目標**: 85点 → 100点（+15点）

---

## 📋 修正項目サマリー

| 項目 | 優先度 | 工数 | 期限 | ステータス |
|------|--------|------|------|----------|
| **C-1**: followerGrowth修正 | 🚨 Critical | 3h | 1/9 | ✅ 設計完了 |
| **H-1**: データ統一関数 | ⚠️ High | 4h | 1/10 | ✅ 設計完了 |
| **H-2**: 集計ロジック文書化 | ⚠️ High | 1h | 1/10 | ✅ 設計完了 |

**合計工数**: 8時間  
**実装可否**: ✅ 可能

---

## 🚨 C-1: followerGrowth計算ロジック修正

### 問題の詳細

**現状**:
```typescript
// app/report/page.tsx（行467-474）
const baseData = isXTeam ? {
  postCount: parseInt(xPostCount) || 0,
  postUrls: xPostUrls.filter(url => url.trim() !== ""),
  likeCount: parseInt(xLikeCount) || 0,
  replyCount: parseInt(xReplyCount) || 0,
  xFollowers: parseInt(xFollowers) || 0, // ⚠️ ストック値を直接送信
  todayComment: xTodayComment || "",
} : {
  accountId: accountId || "",
  igViews: parseInt(igViews) || 0,
  igProfileAccess: parseInt(igProfileAccess) || 0,
  igExternalTaps: parseInt(igExternalTaps) || 0,
  igInteractions: parseInt(igInteractions) || 0,
  weeklyStories: parseInt(weeklyStories) || 0,
  igFollowers: parseInt(igFollowers) || 0,      // ⚠️ ストック値
  ytFollowers: parseInt(ytFollowers) || 0,      // ⚠️ ストック値
  tiktokFollowers: parseInt(tiktokFollowers) || 0, // ⚠️ ストック値
  igPosts: parseInt(igPosts) || 0,
  ytPosts: parseInt(ytPosts) || 0,
  tiktokPosts: parseInt(tiktokPosts) || 0,
  todayComment: todayComment || "",
};
```

**問題点**:
- フォロワー数を「現在値（ストック）」として直接保存
- エナジー計算時に差分（フロー）ではなく累計値を使用
- 結果: 10,000フォロワーの人は毎日10,000人増の扱いになる

---

### 修正方針

#### ステップ1: Firestoreスキーマ拡張

```typescript
// lib/report-schema.ts に追加

export interface Report {
  // ... 既存フィールド
  
  // 🆕 ストック値（表示用）
  igFollowersStock?: number;      // IG現在フォロワー数
  ytFollowersStock?: number;      // YT現在フォロワー数
  tiktokFollowersStock?: number;  // TT現在フォロワー数
  xFollowersStock?: number;       // X現在フォロワー数
  
  // 🆕 フロー値（計算用）
  igFollowers: number;      // IG増加数（前回比）
  ytFollowers: number;      // YT増加数（前回比）
  tiktokFollowers: number;  // TT増加数（前回比）
  xFollowers?: number;      // X増加数（前回比）※X系のみ
}
```

#### ステップ2: 前回値取得関数の追加

```typescript
// lib/firestore.ts に追加

/**
 * ユーザーの前回レポートからフォロワー数を取得
 */
export async function getPreviousFollowerCounts(
  userId: string,
  teamType: 'shorts' | 'x'
): Promise<{
  igFollowers: number;
  ytFollowers: number;
  tiktokFollowers: number;
  xFollowers: number;
} | null> {
  try {
    const reportsRef = collection(db, 'reports');
    const q = query(
      reportsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // 初回報告
      return {
        igFollowers: 0,
        ytFollowers: 0,
        tiktokFollowers: 0,
        xFollowers: 0
      };
    }
    
    const lastReport = snapshot.docs[0].data() as Report;
    
    return {
      igFollowers: lastReport.igFollowersStock || 0,
      ytFollowers: lastReport.ytFollowersStock || 0,
      tiktokFollowers: lastReport.tiktokFollowersStock || 0,
      xFollowers: lastReport.xFollowersStock || 0
    };
  } catch (error) {
    console.error('前回フォロワー数取得エラー:', error);
    return null;
  }
}
```

#### ステップ3: app/report/page.tsx の修正

```typescript
// handleSubmit関数内（行438-540）

// 🆕 前回のフォロワー数を取得
const previousFollowers = await getPreviousFollowerCounts(
  user.uid,
  isXTeam ? 'x' : 'shorts'
);

if (!previousFollowers) {
  setError("前回データの取得に失敗しました");
  return;
}

const baseData = isXTeam ? {
  postCount: parseInt(xPostCount) || 0,
  postUrls: xPostUrls.filter(url => url.trim() !== ""),
  likeCount: parseInt(xLikeCount) || 0,
  replyCount: parseInt(xReplyCount) || 0,
  
  // ✅ ストック値（表示用）
  xFollowersStock: parseInt(xFollowers) || 0,
  
  // ✅ フロー値（計算用）= 現在値 - 前回値
  xFollowers: Math.max(0, (parseInt(xFollowers) || 0) - previousFollowers.xFollowers),
  
  todayComment: xTodayComment || "",
} : {
  accountId: accountId || "",
  igViews: parseInt(igViews) || 0,
  igProfileAccess: parseInt(igProfileAccess) || 0,
  igExternalTaps: parseInt(igExternalTaps) || 0,
  igInteractions: parseInt(igInteractions) || 0,
  weeklyStories: parseInt(weeklyStories) || 0,
  
  // ✅ ストック値（表示用）
  igFollowersStock: parseInt(igFollowers) || 0,
  ytFollowersStock: parseInt(ytFollowers) || 0,
  tiktokFollowersStock: parseInt(tiktokFollowers) || 0,
  
  // ✅ フロー値（計算用）= 現在値 - 前回値
  igFollowers: Math.max(0, (parseInt(igFollowers) || 0) - previousFollowers.igFollowers),
  ytFollowers: Math.max(0, (parseInt(ytFollowers) || 0) - previousFollowers.ytFollowers),
  tiktokFollowers: Math.max(0, (parseInt(tiktokFollowers) || 0) - previousFollowers.tiktokFollowers),
  
  igPosts: parseInt(igPosts) || 0,
  ytPosts: parseInt(ytPosts) || 0,
  tiktokPosts: parseInt(tiktokPosts) || 0,
  todayComment: todayComment || "",
};
```

#### ステップ4: エナジー計算ロジックの確認

```typescript
// lib/energy-economy.ts（行107-118）
// ✅ すでに正しく実装されている

export function calculateKPIScore(kpi: KPIData): number {
  if (kpi.type === 'shorts') {
    return (
      kpi.impressions * 0.0001 +
      kpi.profileAccess * 0.01 +
      kpi.followerGrowth * 0.1 +  // ← フロー値を使用（正しい）
      kpi.interactions * 0.001
    );
  } else {
    // X系は followerGrowth を使用しないため、問題なし
    return (
      kpi.likes * 0.01 +
      kpi.replies * 0.02 +
      kpi.posts * 0.5
    );
  }
}
```

---

### テストケース

#### テストケース1: 初回報告

```typescript
// 入力
currentFollowers: 1000
previousFollowers: 0

// 期待される結果
followerGrowth: 1000  // ✅ 正しい（初回なので全体が増加数）
energy: 100E (1000 * 0.1 = 100)
```

#### テストケース2: 2回目報告（増加）

```typescript
// 入力
currentFollowers: 1050
previousFollowers: 1000

// 期待される結果
followerGrowth: 50  // ✅ 正しい（50人増）
energy: 5E (50 * 0.1 = 5)
```

#### テストケース3: フォロワー減少

```typescript
// 入力
currentFollowers: 980
previousFollowers: 1000

// 期待される結果
followerGrowth: 0  // ✅ Math.max(0, -20) = 0（マイナスは0扱い）
energy: 0E
```

#### テストケース4: 大幅増加

```typescript
// 入力
currentFollowers: 11000
previousFollowers: 10000

// 期待される結果
followerGrowth: 1000  // ✅ 正しい（1000人増）
energy: 100E (1000 * 0.1 = 100)
```

---

### 移行計画

#### Phase 1: バックグラウンド準備（1/9 午前）
1. `getPreviousFollowerCounts()` 関数を `lib/firestore.ts` に追加
2. `Report` 型に `*FollowersStock` フィールドを追加

#### Phase 2: レポート送信ロジック修正（1/9 午後）
1. `app/report/page.tsx` の `handleSubmit` を修正
2. 差分計算ロジック追加
3. ローカルテスト実行

#### Phase 3: 検証（1/9 夜）
1. テストユーザーで4つのテストケースを実行
2. Firestoreのデータ確認
3. エナジー計算の正確性確認

#### Phase 4: 本番適用（1/10 午前）
1. feature/gamificationブランチにコミット
2. 管理者に通知
3. 全メンバーに周知

---

## ⚠️ H-1: データ統一関数の作成

### 目的

マイページ、ランキング、詳細モーダルの3画面で表示される数値を統一し、「1円の狂いもない」整合性を保証。

---

### 設計: 統一データ取得関数

#### 新規ファイル: `lib/unified-data.ts`

```typescript
/**
 * CC-Insight 統一データ取得層
 * 
 * マイページ、ランキング、詳細モーダルの全てで同一のデータソースを使用。
 * 表示整合性を100%保証。
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { getCurseState } from './energy-economy';
import { calculateCurrentStreak } from './streak-system';

// =====================================
// 型定義
// =====================================

export interface UnifiedUserData {
  // 基本情報
  userId: string;
  displayName: string;
  realName: string;
  team: string;
  teamType: 'shorts' | 'x';
  
  // エナジー関連
  totalEnergy: number;           // 保有エナジー
  cumulativeEnergy: number;      // 累計獲得エナジー
  weeklyEnergy: number;          // 週間獲得エナジー
  monthlyEnergy: number;         // 月間獲得エナジー
  
  // ストリーク関連
  currentStreak: number;         // 現在のストリーク
  maxStreak: number;             // 最長ストリーク
  streakTier: 'SPARK' | 'FLAME' | 'INFERNO';
  
  // 呪い状態
  curseLevel: 'normal' | 'anxiety' | 'weakness' | 'cursed';
  curseMultiplier: number;
  daysWithoutSubmission: number;
  
  // 守護神情報
  activeGuardianId: string;
  guardianStage: number;
  guardianTotalEnergy: number;
  
  // 最新KPI（表示用）
  latestKPI: {
    impressions?: number;
    profileAccess?: number;
    followerGrowth?: number;
    interactions?: number;
    likes?: number;
    replies?: number;
    posts?: number;
  };
  
  // 過去7日間のレポート
  recentReports: any[];
}

export interface UnifiedRankingData {
  weeklyRanking: RankingEntry[];
  monthlyRanking: RankingEntry[];
}

export interface RankingEntry {
  userId: string;
  displayName: string;
  realName: string;
  team: string;
  energy: number;
  guardianId: string;
  guardianStage: number;
  rank: number;
  percentile: number;  // 上位何%か
}

// =====================================
// 🎯 統一データ取得関数
// =====================================

/**
 * ユーザーの全データを統一取得（マイページ、詳細モーダル用）
 * 
 * この関数を使用することで、どの画面でも同じ数値が表示されることを保証。
 */
export async function getUnifiedUserData(userId: string): Promise<UnifiedUserData | null> {
  try {
    // 1. 守護神プロフィール取得
    const guardianProfileDoc = await getDoc(doc(db, 'guardianProfiles', userId));
    if (!guardianProfileDoc.exists()) {
      return null;
    }
    const guardianProfile = guardianProfileDoc.data();
    
    // 2. ユーザープロフィール取得
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    const userProfile = userDoc.data();
    
    // 3. 過去7日間のレポート取得
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const reportsQuery = query(
      collection(db, 'reports'),
      where('userId', '==', userId),
      where('createdAt', '>=', sevenDaysAgo),
      orderBy('createdAt', 'desc')
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    const recentReports = reportsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // 4. 週間エナジー計算
    const weeklyEnergy = recentReports.reduce((sum, report) => 
      sum + (report.energyEarned || 0), 0
    );
    
    // 5. 月間エナジー計算（過去30日）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyReportsQuery = query(
      collection(db, 'reports'),
      where('userId', '==', userId),
      where('createdAt', '>=', thirtyDaysAgo),
      orderBy('createdAt', 'desc')
    );
    
    const monthlySnapshot = await getDocs(monthlyReportsQuery);
    const monthlyEnergy = monthlySnapshot.docs.reduce((sum, doc) => 
      sum + (doc.data().energyEarned || 0), 0
    );
    
    // 6. ストリーク計算
    const currentStreak = calculateCurrentStreak(recentReports);
    const streakTier = currentStreak >= 30 ? 'INFERNO' :
                      currentStreak >= 7 ? 'FLAME' : 'SPARK';
    
    // 7. 呪い状態判定
    const lastReportDate = recentReports[0]?.createdAt?.toDate();
    const daysSinceLastReport = lastReportDate 
      ? Math.floor((Date.now() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const curseState = getCurseState(daysSinceLastReport);
    
    // 8. 最新KPI取得
    const latestReport = recentReports[0] || {};
    const latestKPI = {
      impressions: latestReport.igViews,
      profileAccess: latestReport.igProfileAccess,
      followerGrowth: latestReport.igFollowers,  // ✅ フロー値
      interactions: latestReport.igInteractions,
      likes: latestReport.likeCount,
      replies: latestReport.replyCount,
      posts: latestReport.postCount,
    };
    
    // 9. 統一データ返却
    return {
      userId,
      displayName: userProfile.displayName || 'Unknown',
      realName: userProfile.realName || userProfile.displayName || 'Unknown',
      team: userProfile.team,
      teamType: userProfile.teamType || 'shorts',
      
      totalEnergy: guardianProfile.totalEnergy || 0,
      cumulativeEnergy: guardianProfile.cumulativeEnergy || 0,
      weeklyEnergy,
      monthlyEnergy,
      
      currentStreak,
      maxStreak: guardianProfile.maxStreak || 0,
      streakTier,
      
      curseLevel: curseState.level,
      curseMultiplier: curseState.multiplier,
      daysWithoutSubmission: curseState.daysWithoutSubmission,
      
      activeGuardianId: guardianProfile.activeGuardianId,
      guardianStage: guardianProfile.guardians?.[guardianProfile.activeGuardianId]?.stage || 0,
      guardianTotalEnergy: guardianProfile.guardians?.[guardianProfile.activeGuardianId]?.totalEnergy || 0,
      
      latestKPI,
      recentReports,
    };
  } catch (error) {
    console.error('統一データ取得エラー:', error);
    return null;
  }
}

/**
 * ランキングデータを統一取得
 * 
 * 週間/月間の両方を同時に計算し、整合性を保証。
 */
export async function getUnifiedRankingData(
  teamType: 'shorts' | 'x'
): Promise<UnifiedRankingData> {
  try {
    // 1. 全ユーザーの guardianProfiles 取得
    const guardianProfilesSnapshot = await getDocs(collection(db, 'guardianProfiles'));
    const allProfiles = guardianProfilesSnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    }));
    
    // 2. チームタイプでフィルター
    const teamProfiles = allProfiles.filter(p => 
      p.teamType === teamType || (p.team && p.team.includes(teamType === 'x' ? 'buppan' : 'fukugyou'))
    );
    
    // 3. 各ユーザーの週間/月間エナジー計算
    const rankingData = await Promise.all(teamProfiles.map(async (profile) => {
      const userData = await getUnifiedUserData(profile.userId);
      if (!userData) return null;
      
      return {
        userId: profile.userId,
        displayName: userData.displayName,
        realName: userData.realName,
        team: userData.team,
        weeklyEnergy: userData.weeklyEnergy,
        monthlyEnergy: userData.monthlyEnergy,
        guardianId: userData.activeGuardianId,
        guardianStage: userData.guardianStage,
      };
    }));
    
    const validData = rankingData.filter(d => d !== null);
    
    // 4. 週間ランキング作成
    const weeklyRanking = validData
      .sort((a, b) => b!.weeklyEnergy - a!.weeklyEnergy)
      .map((entry, index) => ({
        ...entry!,
        rank: index + 1,
        percentile: ((index + 1) / validData.length) * 100,
        energy: entry!.weeklyEnergy,
      }));
    
    // 5. 月間ランキング作成
    const monthlyRanking = validData
      .sort((a, b) => b!.monthlyEnergy - a!.monthlyEnergy)
      .map((entry, index) => ({
        ...entry!,
        rank: index + 1,
        percentile: ((index + 1) / validData.length) * 100,
        energy: entry!.monthlyEnergy,
      }));
    
    return {
      weeklyRanking,
      monthlyRanking,
    };
  } catch (error) {
    console.error('統一ランキングデータ取得エラー:', error);
    return {
      weeklyRanking: [],
      monthlyRanking: [],
    };
  }
}
```

---

### 使用例

#### マイページ（app/mypage/page.tsx）

```typescript
// Before（現状）
const guardianProfile = await getUserGuardianProfile(user.uid);
const recentReports = await getRecentReports(user.uid, 7);
const streakDays = calculateCurrentStreak(recentReports);
// ... 各所でバラバラに計算

// After（統一関数使用）
const userData = await getUnifiedUserData(user.uid);

// 全ての数値が統一されたデータソースから取得
<div>保有エナジー: {userData.totalEnergy}E</div>
<div>週間獲得: {userData.weeklyEnergy}E</div>
<div>ストリーク: {userData.currentStreak}日</div>
```

#### ランキング（app/ranking/page.tsx）

```typescript
// Before（現状）
const weeklyData = await getRankingData('weekly');
const monthlyData = await getRankingData('monthly');
// ... 別々に計算

// After（統一関数使用）
const rankingData = await getUnifiedRankingData('shorts');

// 週間と月間が同じ計算ロジックで生成されることを保証
<Tab value="weekly">
  {rankingData.weeklyRanking.map(entry => ...)}
</Tab>
<Tab value="monthly">
  {rankingData.monthlyRanking.map(entry => ...)}
</Tab>
```

#### 詳細モーダル（components/member-detail-modal.tsx）

```typescript
// Before（現状）
const memberData = props.member; // propsから渡されたデータ（整合性不明）

// After（統一関数使用）
const userData = await getUnifiedUserData(memberId);

// マイページと完全に同じ数値が表示される
<div>保有エナジー: {userData.totalEnergy}E</div>
<div>週間獲得: {userData.weeklyEnergy}E</div>
```

---

### メリット

1. **数値の完全一致**: 3画面で同じ関数を使用するため、表示の食い違いがゼロ
2. **メンテナンス性**: 計算ロジックの変更は1箇所だけ
3. **デバッグ容易**: 問題が発生しても原因特定が簡単
4. **型安全性**: TypeScriptの型で保証

---

## 📝 H-2: 集計ロジックの文書化

### 週間ランキング計算式

```typescript
// 過去7日間のレポートから合計
weeklyEnergy = Σ(reports[i].energyEarned)
  where reports[i].createdAt >= (today - 7 days)
```

### 月間ランキング計算式

```typescript
// 過去30日間のレポートから合計
monthlyEnergy = Σ(reports[i].energyEarned)
  where reports[i].createdAt >= (today - 30 days)
```

### ストリーク計算式

```typescript
// 連続報告日数をカウント
currentStreak = count(consecutive_days)
  where each day has at least one report
  and no gap > 48 hours
```

---

## ✅ 実装チェックリスト

### C-1: followerGrowth修正

- [ ] `getPreviousFollowerCounts()` 関数作成
- [ ] `Report` 型に `*FollowersStock` 追加
- [ ] `app/report/page.tsx` 修正
- [ ] テストケース4種実行
- [ ] 本番適用

### H-1: データ統一関数

- [ ] `lib/unified-data.ts` ファイル作成
- [ ] `getUnifiedUserData()` 関数実装
- [ ] `getUnifiedRankingData()` 関数実装
- [ ] マイページで使用
- [ ] ランキングで使用
- [ ] 詳細モーダルで使用
- [ ] 3画面の数値一致確認

### H-2: ドキュメント

- [x] 集計ロジック文書化（この文書）
- [ ] READMEに追記

---

## 🎯 期待される効果

### C-1修正後

**修正前**:
```
ユーザーA: 10,000フォロワー → 毎日1000Eゲット（不正確）
ユーザーB: 100フォロワー → 毎日10Eゲット（不正確）
```

**修正後**:
```
ユーザーA: 10フォロワー増 → 1Eゲット（正確）
ユーザーB: 10フォロワー増 → 1Eゲット（正確）
```

**公平性**: ✅ 完璧

### H-1導入後

**導入前**:
```
マイページ: 1000E
ランキング: 995E  ← 5E の食い違い！
詳細モーダル: 1002E  ← 2E の食い違い！
```

**導入後**:
```
マイページ: 1000E
ランキング: 1000E  ← 完全一致！
詳細モーダル: 1000E  ← 完全一致！
```

**信頼性**: ✅ 完璧

---

## 🚀 1月10日までのスケジュール

### 1月9日（木）

**午前（9:00-12:00）**:
- [ ] C-1: `getPreviousFollowerCounts()` 関数作成
- [ ] C-1: `Report` 型拡張
- [ ] C-1: `app/report/page.tsx` 修正

**午後（13:00-18:00）**:
- [ ] C-1: ローカルテスト（4ケース）
- [ ] H-1: `lib/unified-data.ts` 作成
- [ ] H-1: `getUnifiedUserData()` 実装

**夜（19:00-21:00）**:
- [ ] H-1: `getUnifiedRankingData()` 実装
- [ ] H-1: マイページで使用開始

### 1月10日（金）

**午前（9:00-12:00）**:
- [ ] H-1: ランキングページで使用
- [ ] H-1: 詳細モーダルで使用
- [ ] H-1: 3画面の数値一致確認

**午後（13:00-15:00）**:
- [ ] 全体テスト（テストユーザー5人で確認）
- [ ] ドキュメント最終更新
- [ ] feature/gamificationにコミット

**夕方（15:00-17:00）**:
- [ ] mainブランチにマージ
- [ ] Vercel本番デプロイ
- [ ] 100点到達報告

---

**作成者**: AI Assistant (Cline)  
**最終更新**: 2026/01/08 14:23  
**ステータス**: ✅ 設計完了、実装準備完了  
**期限までの残り時間**: 48時間
