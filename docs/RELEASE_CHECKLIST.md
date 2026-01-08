# 🚀 1月15日リリース - 凱旋マージチェックリスト

**作成日**: 2026/01/08  
**リリース予定日**: 2026/01/15  
**ブランチ**: feature/gamification → main

---

## 📋 リリース前チェックリスト

### Phase 1: コード品質確認（1/10まで）

#### ✅ TypeScript型チェック
```bash
npm run type-check
# または
npx tsc --noEmit
```

- [ ] 型エラーがゼロであることを確認
- [ ] any型の使用を最小限に抑える
- [ ] strict modeで警告なし

#### ✅ ESLint/Prettier チェック
```bash
npm run lint
npm run format
```

- [ ] Lint警告がゼロ
- [ ] コードフォーマット統一
- [ ] 未使用変数/import削除

#### ✅ ビルド成功確認
```bash
npm run build
```

- [ ] ビルドエラーなし
- [ ] 全ページが正常にビルドされる
- [ ] 画像/アセットが正しく含まれる

---

### Phase 2: 機能テスト（1/12まで）

#### ✅ 認証フロー
- [ ] 新規登録
- [ ] メール認証
- [ ] 承認待ち表示
- [ ] 管理者承認
- [ ] ログイン
- [ ] ログアウト

#### ✅ レポート送信
- [ ] Shorts系レポート送信
- [ ] X系レポート送信
- [ ] KPI入力検証
- [ ] エナジー計算正確性
- [ ] **followerGrowth差分計算確認** ⚠️ Critical

#### ✅ ダッシュボード
- [ ] 副業チームダッシュボード表示
- [ ] 退職チームダッシュボード表示
- [ ] 物販チームダッシュボード表示
- [ ] リアルタイム更新動作

#### ✅ ランキング
- [ ] 週間ランキング正確性
- [ ] 月間ランキング正確性
- [ ] チーム別表示
- [ ] TOP3メダル表示
- [ ] 守護神アバター演出（オーラ）

#### ✅ マイページ
- [ ] 保有エナジー表示
- [ ] ストリーク日数表示
- [ ] 呪い状態表示
- [ ] 守護神表示
- [ ] 統計カード表示

#### ✅ 守護神コレクション
- [ ] 全6体表示
- [ ] 進化段階表示
- [ ] エナジー投資機能
- [ ] 解放条件表示

#### ✅ Phase 0-2 新機能
- [ ] デイリーログインボーナス
  - [ ] 初回ログイン時に表示
  - [ ] ティア別パーティクル
  - [ ] エナジー自動付与
  - [ ] 3.5秒後自動クローズ
  
- [ ] 報告成功セレブレーション
  - [ ] パーティクル20個爆発
  - [ ] 守護神の喜び表現
  - [ ] バイブレーション（モバイル）
  
- [ ] ストリークリマインダー
  - [ ] 20h経過時にinfo表示
  - [ ] マイルストーン前日の期待煽り
  
- [ ] タクタイル・フィードバック
  - [ ] ボタン沈み込み
  - [ ] 光の走行エフェクト
  - [ ] カードのマイクロリフト

---

### Phase 3: データ整合性確認（1/13まで）

#### ✅ 数値の一致確認
1. **テストユーザーで報告送信**
```
ユーザー: test-user-001
Shorts系: impressions=10000, profileAccess=100, followerGrowth=10, interactions=1000
```

2. **3画面で数値確認**
- [ ] マイページの保有エナジー
- [ ] ランキングの週間エナジー
- [ ] 詳細モーダルのKPI数値
- [ ] **全て一致していること** ✅

#### ✅ エナジー計算検証
```typescript
// 期待値計算
KPIスコア: 1 + 1 + 1 + 1 = 4
KPIパワード: 4^1.5 = 8
小計: 5 + 8 = 13E
ストリーク(10日): 13 × 2.0 = 26E
```

- [ ] 計算結果が期待値と一致
- [ ] 端数処理（Math.floor）正常
- [ ] ストリーク倍率正常
- [ ] 呪い倍率正常

---

### Phase 4: パフォーマンステスト（1/13まで）

#### ✅ Core Web Vitals
```bash
# Lighthouse実行
npm run build
npm start
# localhost:3000でLighthouse実行
```

**目標値**:
- LCP (Largest Contentful Paint): < 2.5秒
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

- [ ] LCP ≤ 2.5秒
- [ ] FID ≤ 100ms
- [ ] CLS ≤ 0.1
- [ ] Performance Score ≥ 90点

#### ✅ Firestoreクエリ最適化
- [ ] 複合インデックス作成確認
- [ ] クエリ実行時間 < 500ms
- [ ] リアルタイムリスナーの効率化

---

### Phase 5: セキュリティ確認（1/14まで）

#### ✅ 認証・認可
- [ ] 未認証ユーザーは保護ページにアクセス不可
- [ ] 一般ユーザーは管理者ページにアクセス不可
- [ ] Email認証必須
- [ ] 管理者承認必須

#### ✅ Firestore Security Rules
```bash
# ルール確認
firebase firestore:rules:list
```

- [ ] 自分のデータのみ読み書き可能
- [ ] 管理者のみ全データアクセス可能
- [ ] 未認証ユーザーは何も読めない

#### ✅ 環境変数
- [ ] `.env.local.example` 最新
- [ ] 本番環境変数設定（Vercel）
- [ ] APIキー漏洩チェック

---

### Phase 6: モバイル対応確認（1/14まで）

#### ✅ レスポンシブデザイン

**テストデバイス**:
1. iPhone SE (375×667px)
2. iPhone 12 Pro (390×844px)
3. iPad (768×1024px)
4. Android (360×640px)
5. Desktop (1920×1080px)

各デバイスで確認:
- [ ] レイアウト崩れなし
- [ ] タップターゲット ≥ 44×44px
- [ ] 文字サイズ適切（≥ 14px）
- [ ] 画像適切にリサイズ
- [ ] スクロール滑らか

#### ✅ タッチ操作
- [ ] スワイプ操作正常
- [ ] ピンチズーム動作
- [ ] タップ遅延なし
- [ ] バイブレーション動作（対応端末）

---

### Phase 7: ブラウザ互換性確認（1/14まで）

#### ✅ 対応ブラウザテスト
- [ ] Chrome (最新版)
- [ ] Safari (最新版)
- [ ] Firefox (最新版)
- [ ] Edge (最新版)
- [ ] Safari iOS (最新版)
- [ ] Chrome Android (最新版)

各ブラウザで確認:
- [ ] 表示崩れなし
- [ ] アニメーション正常
- [ ] 機能動作正常

---

## 🔄 Git ワークフロー

### Step 1: feature/gamification ブランチの最終確認

```bash
# 現在のブランチ確認
git branch

# 未コミットの変更確認
git status

# 変更がある場合はコミット
git add .
git commit -m "feat: Phase 0-2完了（神話級到達）"

# リモートにプッシュ
git push origin feature/gamification
```

### Step 2: main ブランチを最新化

```bash
# mainブランチに切り替え
git checkout main

# リモートから最新取得
git pull origin main
```

### Step 3: feature/gamification を main にマージ

```bash
# mainブランチにいることを確認
git branch

# feature/gamification をマージ
git merge feature/gamification

# コンフリクトがあれば解決
# エディタで該当ファイルを編集
git add <解決したファイル>
git commit -m "merge: feature/gamification to main"

# リモートにプッシュ
git push origin main
```

### Step 4: タグ付け（リリースバージョン）

```bash
# v1.0.0タグ作成
git tag -a v1.0.0 -m "Release: 神話級到達（Phase 0-2完了）"

# タグをリモートにプッシュ
git push origin v1.0.0
```

---

## 🚀 Vercel デプロイ手順

### Step 1: Vercel プロジェクト確認

1. https://vercel.com/dashboard にアクセス
2. `cc-insight` プロジェクトを選択
3. Settings → General で設定確認

### Step 2: 環境変数設定

Vercel Dashboard → Settings → Environment Variables

**必須環境変数**:
```
NEXT_PUBLIC_FIREBASE_API_KEY=<YOUR_API_KEY>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<YOUR_AUTH_DOMAIN>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<YOUR_PROJECT_ID>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<YOUR_STORAGE_BUCKET>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<YOUR_SENDER_ID>
NEXT_PUBLIC_FIREBASE_APP_ID=<YOUR_APP_ID>
SLACK_WEBHOOK_URL=<YOUR_SLACK_WEBHOOK>
```

- [ ] 全環境変数設定済み
- [ ] Production環境に適用
- [ ] Preview環境に適用

### Step 3: ビルド設定確認

Vercel Dashboard → Settings → Build & Development Settings

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

- [ ] 設定が正しい
- [ ] Node.js バージョン: 18.x 以上

### Step 4: デプロイ実行

```bash
# ローカルからVercelデプロイ（オプション）
npx vercel

# 本番デプロイ
npx vercel --prod
```

**または**:
- mainブランチにpushすると自動デプロイ

### Step 5: デプロイ成功確認

1. Vercel Dashboard → Deployments
2. 最新デプロイメントのステータス確認
3. **Ready** になっていることを確認
4. URLをクリックして本番サイト確認

---

## 🧪 本番環境最終テスト

### Step 1: 本番URLアクセス

```
https://cc-insight.vercel.app
```

- [ ] サイトが正常に表示される
- [ ] ローディングが高速（< 3秒）

### Step 2: 全機能テスト（再実行）

Phase 2の全テストを本番環境で再実行:
- [ ] 認証フロー
- [ ] レポート送信
- [ ] ランキング表示
- [ ] マイページ表示
- [ ] 守護神コレクション
- [ ] Phase 0-2 新機能

### Step 3: モバイル実機テスト

実際のスマートフォンでアクセス:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] タブレット

### Step 4: 複数ユーザー同時アクセステスト

5人以上で同時に:
- [ ] レポート送信
- [ ] ランキング閲覧
- [ ] レスポンス遅延なし

---

## 📊 監視・モニタリング設定

### Vercel Analytics 有効化

Vercel Dashboard → Analytics
- [ ] Web Analytics 有効化
- [ ] Real User Monitoring 有効化

### Firestore 使用量監視

Firebase Console → Usage
- [ ] 読み取り回数監視
- [ ] 書き込み回数監視
- [ ] アラート設定（80%到達時）

### エラー監視

- [ ] Vercel ログ確認
- [ ] Firebase エラーログ確認
- [ ] Slack通知テスト

---

## 🎯 リリース判定基準

### ✅ 必須条件（全て満たす必要あり）

- [ ] 全機能テスト合格
- [ ] データ整合性確認完了
- [ ] パフォーマンス目標達成
- [ ] セキュリティ確認完了
- [ ] モバイル対応完璧
- [ ] ブラウザ互換性確認完了
- [ ] **Critical項目（C-1）修正完了** ⚠️

### ⚠️ 条件付き許可項目

- High優先度項目（H-1, H-2）は1/15までに修正
- Medium優先度項目（M-1）は1/15以降でも可

---

## 📝 リリースノート（draft）

```markdown
# CC-Insight v1.0.0 - 「神話級」到達リリース

## 🎉 新機能

### Phase 0: 完成度200%達成
- ✨ 報告成功セレブレーション（パーティクル20個、バイブレーション）
- 💬 守護神の対話深化システム（状態適応型セリフ）
- ⏳ ブランド統一ローディング（守護神シンボル回転）
- ❌ エラーハンドリング統一（ユーザーフレンドリー）
- 📱 レスポンシブ完璧化（5デバイス対応）

### Phase 1: 中毒性強化
- 🎁 デイリーログインボーナス（5段階ティア）
- ⏰ ストリークリマインダー（4段階緊迫感）

### Phase 2: 洗練とパフォーマンス
- 🎯 タクタイル・フィードバック（ボタン沈み込み、光の走行）
- 🎨 500行の高級感CSS追加

## 📈 改善内容
- エナジー計算ロジックの正確性向上
- 表示整合性の強化
- パフォーマンス最適化

## 🔧 技術スタック
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Firebase Firestore
- Framer Motion
- Tailwind CSS

## 📊 完成度
**100%達成（神話級）** 👑

リリース日: 2026/01/15
```

---

## 🚨 ロールバック手順（緊急時）

### 重大なバグが発見された場合

```bash
# 1. 前のバージョンにロールバック
git revert HEAD
git push origin main

# 2. Vercelで前のデプロイメントに切り替え
# Vercel Dashboard → Deployments
# 前のデプロイメント → Promote to Production

# 3. チーム全員に通知（Slack）
```

---

## 📞 リリース後のサポート体制

### 1/15 (リリース当日)
- 全員待機（9:00-21:00）
- Slackチャンネル監視
- エラーログ常時確認

### 1/16-1/17 (リリース後2日間)
- 主要メンバー待機
- 問い合わせ対応準備

### 監視項目
- エラー発生率
- レスポンスタイム
- ユーザー登録数
- レポート送信数
- DAU（日次アクティブユーザー）

---

## ✅ 最終承認

### チェック担当者

| 項目 | 担当者 | 完了日 | 承認 |
|------|--------|--------|------|
| コード品質確認 | 開発チーム | 1/10 | [ ] |
| 機能テスト | QAチーム | 1/12 | [ ] |
| データ整合性確認 | 開発チーム | 1/13 | [ ] |
| パフォーマンステスト | 開発チーム | 1/13 | [ ] |
| セキュリティ確認 | セキュリティ担当 | 1/14 | [ ] |
| モバイル対応確認 | デザインチーム | 1/14 | [ ] |
| ブラウザ互換性確認 | QAチーム | 1/14 | [ ] |
| **最終承認** | **菅原副社長** | **1/14** | **[ ]** |

---

**作成者**: AI Assistant (Cline)  
**最終更新**: 2026/01/08 14:16  
**ステータス**: ✅ 準備完了  
**リリース可否**: **条件付き可**（Critical項目修正後）
