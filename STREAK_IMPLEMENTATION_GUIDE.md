# 🔥 ストリークシステム実装ガイド

**1月15日リリースに向けた統合手順書**

---

## 📋 完成した基盤コンポーネント

### ✅ Phase 1: コアロジック（完了）
- `lib/streak-system.ts` (340行) - ストリーク判定・XPボーナス・警告メッセージ生成
- `lib/firestore.ts` - User型にストリークフィールド追加

### ✅ Phase 2: 祝福演出（完了）
- `components/streak-celebration.tsx` (210行)
  - `StreakCelebration` - 報告完了時のポップアップ
  - `StreakWarningBanner` - 損失回避の警告バナー

### ✅ Phase 3: 炎アイコン（完了）
- `components/streak-flame-icon.tsx` (260行)
  - `StreakFlameIcon` - 基本炎アイコン
  - `StreakFlameBadge` - ツールチップ付きバッジ
  - `StreakComparison` - 比較表示

---

## 🎯 Phase 4: 報告ページへの統合

### ファイル: `app/report/page.tsx`

#### ステップ1: インポート追加

```typescript
import { 
  shouldUpdateStreak, 
  calculateStreakBonus, 
  getStreakCelebrationMessage,
  getStreakWarningMessage 
} from "@/lib/streak-system";
import { StreakCelebration, StreakWarningBanner } from "@/components/streak-celebration";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
```

#### ステップ2: State追加

```typescript
// ストリーク祝福用
const [showCelebration, setShowCelebration] = useState(false);
const [celebrationData, setCelebrationData] = useState<any>(null);

// ストリーク警告用
const [streakWarning, setStreakWarning] = useState<any>(null);
```

#### ステップ3: 警告チェック（useEffect）

```typescript
useEffect(() => {
  if (!user || !userProfile) return;

  const checkStreakWarning = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const warning = getStreakWarningMessage(
          userData.lastReportDate,
          userData.currentStreak || 0
        );
        setStreakWarning(warning);
      }
    } catch (error) {
      console.error("ストリーク警告チェックエラー:", error);
    }
  };

  checkStreakWarning();
  // 1時間ごとにチェック
  const interval = setInterval(checkStreakWarning, 60 * 60 * 1000);
  return () => clearInterval(interval);
}, [user, userProfile]);
```

#### ステップ4: 報告送信時のストリーク更新

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... 既存の検証処理 ...
  
  try {
    // 1. ユーザーの現在のストリーク情報を取得
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();
    
    const currentStreak = userData?.currentStreak || 0;
    const maxStreak = userData?.maxStreak || 0;
    const lastReportDate = userData?.lastReportDate;
    
    // 2. ストリーク判定
    const streakCheck = shouldUpdateStreak(lastReportDate, new Date(), true);
    
    let newStreak = currentStreak;
    if (streakCheck.shouldReset) {
      // 鎮火：リセット
      newStreak = 1;
    } else if (streakCheck.shouldUpdate) {
      // 継続：+1
      newStreak = currentStreak + 1;
    } else {
      // 24時間以内の再報告：変化なし
      newStreak = currentStreak;
    }
    
    const newMaxStreak = Math.max(newStreak, maxStreak);
    const isNewRecord = newStreak > maxStreak;
    
    // 3. XPボーナス計算
    const xpBonus = calculateStreakBonus(newStreak);
    
    // 4. 報告データを保存
    await addDoc(collection(db, "reports"), {
      ...reportData,
      createdAt: serverTimestamp(),
    });
    
    // 5. ユーザーのストリーク情報を更新
    await setDoc(userDocRef, {
      currentStreak: newStreak,
      maxStreak: newMaxStreak,
      lastReportDate: Timestamp.now()
    }, { merge: true });
    
    // 6. 祝福メッセージ生成
    const celebrationMessage = getStreakCelebrationMessage(newStreak, isNewRecord);
    
    // 7. 祝福ポップアップ表示
    setCelebrationData({
      newStreak,
      isNewRecord,
      xpBonus,
      celebrationMessage
    });
    setShowCelebration(true);
    
    // ... 既存のリセット処理 ...
    
  } catch (error) {
    // ... エラーハンドリング ...
  }
};
```

#### ステップ5: JSX追加

```tsx
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
    {/* 警告バナー */}
    {streakWarning && (
      <StreakWarningBanner 
        warning={streakWarning} 
        onClose={() => setStreakWarning(null)} 
      />
    )}
    
    {/* 既存のフォーム */}
    <form onSubmit={handleSubmit}>
      {/* ... 既存のコンテンツ ... */}
    </form>
    
    {/* 祝福ポップアップ */}
    {showCelebration && celebrationData && (
      <StreakCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        streakData={celebrationData}
      />
    )}
  </div>
);
```

---

## 🏆 Phase 5: ランキングページへの統合

### ファイル: `app/ranking/page.tsx`

#### ステップ1: インポート追加

```typescript
import { StreakFlameBadge } from "@/components/streak-flame-icon";
import { getAllUsers } from "@/lib/firestore";
```

#### ステップ2: ユーザー情報取得

```typescript
const [usersMap, setUsersMap] = useState<Map<string, any>>(new Map());

useEffect(() => {
  const loadUsers = async () => {
    try {
      const users = await getAllUsers();
      const map = new Map();
      users.forEach(user => {
        map.set(user.email, {
          currentStreak: user.currentStreak || 0,
          maxStreak: user.maxStreak || 0
        });
      });
      setUsersMap(map);
    } catch (error) {
      console.error("ユーザー情報取得エラー:", error);
    }
  };
  loadUsers();
}, []);
```

#### ステップ3: ランキング表示に炎アイコン追加

```tsx
{rankings.map((member: any, index: number) => {
  const userStreak = usersMap.get(member.email) || { currentStreak: 0, maxStreak: 0 };
  
  return (
    <div key={member.name} className="flex items-center gap-4 p-4">
      {/* 順位 */}
      <div className="text-2xl font-bold">#{index + 1}</div>
      
      {/* 炎アイコン */}
      <StreakFlameBadge
        currentStreak={userStreak.currentStreak}
        maxStreak={userStreak.maxStreak}
        size="md"
      />
      
      {/* メンバー名・チーム */}
      <div className="flex-1">
        <div className="font-bold">{member.name}</div>
        <div className="text-sm text-slate-400">{member.teamName}</div>
      </div>
      
      {/* スコア */}
      <div className="text-right">
        <div className="text-2xl font-bold">{member[type].toLocaleString()}</div>
        <div className="text-xs text-slate-500">{/* ラベル */}</div>
      </div>
    </div>
  );
})}
```

---

## 💎 Phase 6: マイページへの統合（オプション）

### ファイル: `app/mypage/page.tsx`

#### ストリーク情報表示

```tsx
import { StreakFlameIcon, StreakComparison } from "@/components/streak-flame-icon";

// メインエリアに大きく表示
<div className="text-center mb-8">
  <h3 className="text-lg text-slate-400 mb-4">現在のストリーク</h3>
  <StreakFlameIcon 
    currentStreak={userProfile.currentStreak || 0}
    size="lg"
    showCount={true}
  />
  {userProfile.maxStreak && userProfile.maxStreak > (userProfile.currentStreak || 0) && (
    <p className="text-sm text-slate-500 mt-2">
      過去最高: {userProfile.maxStreak}日連続
    </p>
  )}
</div>
```

---

## 🔧 必要な設定

### 1. Firestore セキュリティルール

```javascript
// users コレクション
match /users/{userId} {
  allow read: if request.auth != null;
  allow update: if request.auth.uid == userId 
    && request.resource.data.diff(resource.data).affectedKeys()
      .hasOnly(['currentStreak', 'maxStreak', 'lastReportDate', 'lastLoginAt']);
}
```

### 2. Firestore インデックス（不要）

ストリーク機能は既存のインデックスで動作します。

---

## 🎮 動作確認手順

### テスト1: 初回報告
1. ユーザーでログイン
2. 報告を送信
3. ✅ 「🔥 1日連続達成！」ポップアップ表示
4. ✅ XPボーナス: 1.05倍

### テスト2: 連続報告
1. 翌日（24時間後）に報告
2. ✅ 「🔥 2日連続達成！」ポップアップ表示
3. ✅ XPボーナス: 1.10倍

### テスト3: 7日目（青炎）
1. 7日連続で報告
2. ✅ 「💎 習慣の青炎に到達！」特別演出
3. ✅ ランキングで青い炎アイコン表示

### テスト4: 48時間経過（鎮火）
1. 48時間以上報告しない
2. 次の報告時に
3. ✅ ストリークが1にリセット
4. ✅ 「再スタート」メッセージ

### テスト5: 警告表示
1. 報告から20時間経過
2. ✅ 青色の情報バナー表示
3. 報告から36時間経過
4. ✅ 黄色の警告バナー表示
5. 報告から44時間経過
6. ✅ 赤色のクリティカルバナー表示

---

## 📊 データ構造

### Firestore: users/{userId}

```typescript
{
  // ... 既存のフィールド ...
  currentStreak: 7,  // 現在の連続日数
  maxStreak: 10,     // 過去最高記録
  lastReportDate: Timestamp  // 最後の報告日時
}
```

---

## 🎯 心理設計の意図

### ドーパミン放出
- 報告完了時の巨大な絵文字演出
- マイルストーン達成の特別メッセージ
- XPボーナスの視覚的フィードバック

### 損失回避
- 「消滅まであと○時間」の緊迫感
- 3段階警告で段階的プレッシャー
- 「努力を無駄にしないで」の訴求

### 社会的証明
- ランキングでの炎アイコン表示
- 色の違いによる視覚的格差
- 「あの人は青炎だ」という憧れ

### 習慣形成
- 24時間サイクルで自然な報告習慣
- 7日目の「青炎」が最初の目標
- 30日目の「黄金」が究極の目標

---

## 🚀 1月15日までのロードマップ

### Week 1（1/7-1/9）
- ✅ Phase 1-3完了（基盤実装）
- ⏭️ Phase 4: 報告ページ統合
- ⏭️ Phase 5: ランキングページ統合

### Week 2（1/10-1/15）
- テスト・デバッグ
- UI/UX調整
- Vercelデプロイ・本番確認
- 1/15リリース🎉

---

## 💡 実装のヒント

### XPボーナスの適用
既存のガーディアンシステムと統合：
```typescript
const baseXP = calculateBaseXP(report);
const streakBonus = calculateStreakBonus(currentStreak);
const finalXP = baseXP * streakBonus;
```

### 週末スキップの設定
```typescript
// 週末を含める場合
shouldUpdateStreak(lastReportDate, new Date(), true);

// 週末をスキップする場合
shouldUpdateStreak(lastReportDate, new Date(), false);
```

### Slack通知への統合
```typescript
// lib/slack-notifier.ts に追加
export async function notifyStreakMilestone(userName: string, streak: number) {
  if (streak === 7 || streak === 30 || streak === 50 || streak === 100) {
    // マイルストーン達成をSlackに通知
  }
}
```

---

## 📚 参考リンク

- ストリークロジック: `lib/streak-system.ts`
- UIコンポーネント: `components/streak-celebration.tsx`, `components/streak-flame-icon.tsx`
- 型定義: `lib/firestore.ts` (User interface)

---

**🔥 メンバーが日報に中毒になる最強のシステムを実現せよ！1月15日リリースに向けて、全力で突き進め！**
