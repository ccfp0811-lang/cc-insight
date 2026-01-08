# Firestore セキュリティルール設定手順

## 重要: このファイルを Firebase Console で設定してください

`firestore.rules` ファイルが作成されましたが、Firebaseに反映するには手動で設定が必要です。

## 設定手順

### 方法1: Firebase Console (推奨)

1. [Firebase Console](https://console.firebase.google.com/) を開く
2. プロジェクト「cc-insight」を選択
3. 左メニュー「Firestore Database」→「ルール」タブ
4. `firestore.rules` ファイルの内容を全てコピー
5. ルールエディタに貼り付け
6. 「公開」ボタンをクリック

### 方法2: Firebase CLI

```bash
# Firebase CLI がインストールされていない場合
npm install -g firebase-tools

# ログイン
firebase login

# プロジェクト初期化（既に初期化済みの場合はスキップ）
firebase init firestore

# ルールをデプロイ
firebase deploy --only firestore:rules
```

## ルールの概要

このセキュリティルールは以下を保護します:

### users コレクション
- ✅ 読み取り: 認証済みユーザー全員
- ✅ 作成: 自分のドキュメントのみ（role フィールド含めない）
- ✅ 更新: 自分のドキュメントのみ（role 更新は管理者のみ）
- ✅ 削除: 管理者のみ

### reports コレクション
- ✅ 読み取り: 認証済みユーザー全員
- ✅ 作成: 承認済みユーザーのみ、自分の userId のみ
- ✅ 更新: 自分のレポートのみ（userId 変更不可）
- ✅ 削除: 自分のレポートまたは管理者

### guardianProfiles / guardianCollection
- ✅ 読み取り: 認証済みユーザー全員
- ✅ 作成・更新: 自分のデータのみ
- ✅ 削除: 管理者のみ

### messages (DM機能)
- ✅ 読み取り: 送信者・受信者・管理者のみ
- ✅ 作成: 承認済みユーザーのみ（senderId は自分のみ）
- ✅ 更新: 送信者のみ
- ✅ 削除: 送信者または管理者

### penaltyHistory
- ✅ 読み取り: 対象ユーザー本人または管理者
- ✅ 作成・更新・削除: 管理者のみ

### activityLogs
- ✅ 読み取り: 管理者のみ
- ✅ 作成・更新・削除: 禁止（Admin SDK のみ）

## 検証方法

ルール設定後、以下で動作確認:

```bash
# Firebase Emulator で検証（推奨）
firebase emulators:start

# または、Firebase Console のルールシミュレータを使用
```

## 注意事項

⚠️ **重要**: このルールを設定するまで、Firestoreは誰でもアクセス可能な状態です。
⚠️ **至急**: 本番環境では即座にこのルールを適用してください。

## トラブルシューティング

### 「permission-denied」エラーが出る場合

1. ユーザーが `approved: true` になっているか確認
2. `role` フィールドが正しく設定されているか確認
3. Firebase Console のルールシミュレータで検証

### インデックスエラーが出る場合

Firebase Console の「インデックス」タブでエラーリンクをクリックして自動作成
