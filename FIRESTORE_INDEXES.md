# Firestore インデックス設定ガイド

このドキュメントでは、cc-insightで必要なFirestoreの複合インデックスを管理します。

---

## 🔴 必須インデックス

### 1. ユーザー統計取得用（getUserStats）

**コレクション**: `reports`

**フィールド**:
- `userId` (ASC)
- `createdAt` (DESC)

**用途**: メンバー詳細分析ページでユーザーごとのレポートを取得

**クエリ**:
```typescript
query(
  collection(db, "reports"),
  where("userId", "==", userId),
  orderBy("createdAt", "desc")
)
```

**インデックス作成URL**:
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
```

**手動作成手順**:
1. Firebase Console → Firestore Database → Indexes
2. 「Create Index」をクリック
3. Collection: `reports`
4. Field 1: `userId` (Ascending)
5. Field 2: `createdAt` (Descending)
6. 「Create」をクリック
7. インデックス構築完了まで数分待機

---

### 2. チーム別レポート取得用（subscribeToReports）

**コレクション**: `reports`

**フィールド**:
- `team` (ASC)
- `createdAt` (DESC)

**用途**: チーム別ページでリアルタイムデータを取得

**クエリ**:
```typescript
query(
  collection(db, "reports"),
  where("team", "==", teamId),
  orderBy("createdAt", "desc")
)
```

**インデックス作成URL**:
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore/indexes
```

---

### 3. 期間指定レポート取得用（getReportsByPeriod）

**コレクション**: `reports`

**フィールド**:
- `date` (ASC)
- `date` (ASC) ※範囲クエリ用

**用途**: 期間を指定してレポートを取得（今週/今月/四半期）

**クエリ**:
```typescript
query(
  collection(db, "reports"),
  where("date", ">=", startStr),
  where("date", "<=", endStr),
  orderBy("date", "desc")
)
```

**注意**: `date`フィールドでの範囲クエリには自動インデックスで対応可能

---

## ⚠️ エラーが発生した場合

### エラーメッセージ例

```
Error: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/YOUR_PROJECT_ID/firestore/indexes?create_composite=...
```

### 対処方法

1. **エラーメッセージのURLをクリック**
   - Firebase Consoleが開き、必要なインデックス設定が自動入力される
   - 「Create Index」をクリックするだけでOK

2. **インデックス構築完了まで待機**
   - 小規模: 数秒〜数分
   - 大規模: 数時間（データ量に依存）
   - 構築中は「Building」と表示される

3. **ページをリロード**
   - インデックス構築完了後、ページをリロードすれば正常に動作

---

## 📊 現在のインデックス状況

| インデックス | 状態 | 作成日 | 備考 |
|---|---|---|---|
| userId + createdAt | 🔴 未作成 | - | メンバー詳細ページで必須 |
| team + createdAt | ✅ 作成済み | 2026/1/7 | チーム別ページで使用中 |
| date 範囲クエリ | ✅ 自動 | - | 期間指定で使用中 |

---

## 🔧 開発者向けメモ

### 新しいクエリを追加する際のチェックリスト

- [ ] `where()`と`orderBy()`を組み合わせる場合、複合インデックスが必要
- [ ] エラーメッセージにインデックス作成URLが表示されることを確認
- [ ] コード内にコメントで「⚠️ 複合インデックス必須」を明記
- [ ] このドキュメント（FIRESTORE_INDEXES.md）に追記
- [ ] 菅原副社長にインデックス作成を依頼

### エラーハンドリングのベストプラクティス

```typescript
try {
  const reports = await getReports();
} catch (error: any) {
  if (error.code === 'failed-precondition') {
    // インデックス未作成エラー
    console.error("インデックスが必要です:", error.message);
    // UIに「データ準備中（インデックス構築中）」と表示
  } else {
    // その他のエラー
    console.error("データ取得エラー:", error);
  }
}
```

---

## 📚 参考リンク

- [Firebase Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firestore Console](https://console.firebase.google.com/project/_/firestore/indexes)
- [Index Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**最終更新**: 2026/1/7  
**更新者**: CLINE AI  
**プロジェクト**: cc-insight
