# 🛡️ 管理者アカウント設定ガイド

## 概要
このガイドでは、既存のユーザーを管理者（admin）に昇格させる手順を説明します。

---

## 方法1: Firebase Consoleで手動設定（推奨）

### ステップ1: Firebase Consoleにアクセス

1. https://console.firebase.google.com/ にアクセス
2. プロジェクト「cc-insight」を選択

### ステップ2: Firestoreデータベースを開く

1. 左メニューから「Firestore Database」をクリック
2. 「users」コレクションを選択

### ステップ3: 管理者にするユーザーを検索

1. 管理者にしたいユーザーのドキュメントを探す
   - 例: `ccfp0811@gmail.com` のUID
2. そのユーザーのドキュメントIDをクリック

### ステップ4: フィールドを編集

以下のフィールドを編集・追加します：

| フィールド | 値 | 説明 |
|-----------|-----|------|
| `role` | `admin` | 管理者権限を付与 |
| `status` | `approved` | 承認済み状態に変更 |
| `emailVerified` | `true` | メール認証済みに設定 |

**具体的な手順:**
1. `role` フィールドをクリック
2. 値を `admin` に変更
3. `status` フィールドを `approved` に変更
4. `emailVerified` を `true` に変更
5. 「更新」ボタンをクリック

### ステップ5: ログイン確認

1. https://cc-insight.vercel.app/admin/login にアクセス
2. 管理者に設定したメールアドレスでログイン
3. 自動的に `/dashboard` へリダイレクトされる

---

## 方法2: スクリプトで設定（開発環境）

**注意:** この方法はFirebase Admin SDKのセットアップが必要です。

### 前提条件
- Node.jsがインストールされている
- Firebase Admin SDKの秘密鍵（serviceAccountKey.json）を取得済み

### 手順

1. **秘密鍵のダウンロード**
   ```
   Firebase Console → プロジェクト設定 → サービスアカウント
   → 「新しい秘密鍵の生成」→ serviceAccountKey.json
   ```

2. **秘密鍵を配置**
   ```
   プロジェクトルートに serviceAccountKey.json を配置
   ```

3. **スクリプト実行**
   ```bash
   node scripts/set-admin.js ccfp0811@gmail.com
   ```

4. **確認**
   ```
   ✓ ユーザーが見つかりました: UID=...
   ✓ Firestoreを更新しました
   
   管理者設定が完了しました！
   ```

---

## トラブルシューティング

### 問題: ログイン時に「ユーザー情報が見つかりません」エラー

**原因:** Firestoreに`users`ドキュメントが存在しない

**解決策:**
1. Firebase Consoleで `users` コレクションを確認
2. ユーザーのUIDでドキュメントが作成されているか確認
3. 存在しない場合は、以下のフィールドで新規作成：
   ```json
   {
     "uid": "ユーザーのUID",
     "email": "ccfp0811@gmail.com",
     "displayName": "管理者名",
     "team": "fukugyou",
     "role": "admin",
     "status": "approved",
     "emailVerified": true,
     "createdAt": (現在のタイムスタンプ)
   }
   ```

### 問題: ログイン後に「権限がありません」と表示される

**原因:** `role` が `admin` に設定されていない

**解決策:**
1. Firestoreで該当ユーザーの`role`フィールドを確認
2. `admin`になっているか確認
3. なっていない場合は `admin` に変更

### 問題: ログイン後に「承認待ち」画面に飛ばされる

**原因:** `status` が `pending` のまま

**解決策:**
1. Firestoreで該当ユーザーの`status`フィールドを確認
2. `approved` に変更

---

## 管理者アカウントの確認方法

### Firebase Consoleで確認
```
Firestore Database → users → (UID) → 
  role: "admin"
  status: "approved"
  emailVerified: true
```

### ログイン後の確認
- サイドバーに「管理者」と表示される
- 全チームの管理画面にアクセスできる
- ユーザー管理メニューが表示される

---

## セキュリティのベストプラクティス

1. **管理者アカウントは最小限に**
   - 必要最小限の人数だけに付与

2. **定期的な確認**
   - 退職者の管理者権限は即座に削除

3. **監査ログ**
   - 管理者の操作は `approvalLogs` に記録される

4. **管理者ログインURLは非公開**
   - `/admin/login` は一般メンバーには公開しない

---

## 初期管理者の推奨設定

### 菅原副社長のアカウント
```
Email: ccfp0811@gmail.com
Role: admin
Status: approved
Team: fukugyou (任意)
```

### 設定後のアクセス
```
ログインURL: https://cc-insight.vercel.app/admin/login
リダイレクト先: https://cc-insight.vercel.app/dashboard
```

---

**設定完了後、管理者としてログインできることを確認してください！**
