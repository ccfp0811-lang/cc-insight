# 🎨 ミッドジャーニー用「神聖アセット・オーダーリスト」

**作成日**: 2026/01/08  
**目的**: 副社長がミッドジャーニーで最高品質の画像を生成するための発注書  
**世界観**: 宇宙・魔法・ダークファンタジー

---

## 📋 アイコン定義一覧

### 1. エナジーオーブ（Energy Orb）

**現在の状態**: ⚡ 絵文字  
**使用箇所**: マイページ、ランキング、詳細モーダル、ダッシュボード

**仕様**:
- **サイズ**: 512×512px（表示時は48×48px～128×128pxに縮小）
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/energy-orb.png`
- **バリエーション**: 
  - `energy-orb-small.png` (256×256px)
  - `energy-orb-large.png` (1024×1024px)

**推奨プロンプト**:
```
A mystical energy orb floating in space, glowing with purple and pink aurora lights, 
magical cosmic particles swirling around it, fantasy game icon style, 
dark background with nebula, highly detailed, 3D render, 
digital art, cinematic lighting, vibrant colors, glass-like transparency, 
inner light rays, ethereal atmosphere, 8K resolution, centered composition --ar 1:1 --v 6
```

---

### 2. 保有エナジー表示アイコン（Total Energy Icon）

**現在の状態**: 💎 絵文字  
**使用箇所**: マイページ統計カード

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/total-energy-icon.png`

**推奨プロンプト**:
```
A crystalline gem icon, purple to cyan gradient, floating above a dark cosmic background,
surrounded by golden sparkles, fantasy RPG inventory icon, 
sharp edges with inner glow, magical aura effect, 
game UI design, high contrast, clean silhouette, 
digital illustration, vibrant neon colors --ar 1:1 --v 6
```

---

### 3. 累計獲得エナジーアイコン（Cumulative Energy Icon）

**現在の状態**: 📊 絵文字  
**使用箇所**: マイページ統計カード

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/cumulative-energy-icon.png`

**推奨プロンプト**:
```
An upward trending graph icon made of glowing magical energy lines, 
purple and gold gradient, cosmic particles flowing upward, 
fantasy game statistics icon, dark space background, 
ascending arrow motif, constellation pattern, 
digital art, sharp and clean, luminous effect --ar 1:1 --v 6
```

---

### 4. ストリーク炎アイコン（Streak Flame Icon）

**現在の状態**: 🔥 絵文字  
**使用箇所**: マイページ、ランキング、ストリークシステム

**仕様**:
- **サイズ**: 512×512px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/streak-flame.png`
- **バリエーション**:
  - `streak-flame-spark.png` (オレンジ、1-6日)
  - `streak-flame-blue.png` (青炎、7-29日)
  - `streak-flame-inferno.png` (虹色、30日+)

**推奨プロンプト（基本）**:
```
A mystical flame icon, swirling fire with magical energy, 
purple and pink gradient flames, cosmic particles within the fire, 
fantasy game icon, dark background, highly detailed flame texture, 
3D render, glowing core, ethereal smoke trails, 
sharp silhouette, vibrant neon colors --ar 1:1 --v 6
```

**プロンプト（青炎版）**:
```
A mystical blue flame icon, swirling fire with magical energy, 
cyan and azure gradient flames, cold fire effect, 
cosmic particles within the fire, fantasy game icon, 
dark background, highly detailed flame texture, 
ice-fire hybrid appearance, glowing blue core --ar 1:1 --v 6
```

**プロンプト（虹色版）**:
```
A legendary rainbow flame icon, swirling fire with all spectrum colors, 
purple-pink-cyan-gold gradient flames, ultimate magical fire, 
cosmic particles within the fire, fantasy game icon, 
dark background, highly detailed flame texture, 
godly aura, divine appearance, maximum glow --ar 1:1 --v 6
```

---

### 5. ランキングメダル（Ranking Medals）

**現在の状態**: 🥇🥈🥉 絵文字  
**使用箇所**: ランキングページ（TOP 3表示）

**仕様**:
- **サイズ**: 256×256px（各）
- **ファイル形式**: PNG（透過背景）
- **保存先**:
  - `/public/images/ui/medal-gold.png`
  - `/public/images/ui/medal-silver.png`
  - `/public/images/ui/medal-bronze.png`

**推奨プロンプト（金メダル）**:
```
A golden medal icon with cosmic magical aura, 
first place medal, shining gold material with engraved number "1", 
purple nebula background effect, star particles around it, 
fantasy game achievement icon, 3D render, metallic texture, 
rim light, dramatic lighting, high contrast --ar 1:1 --v 6
```

**推奨プロンプト（銀メダル）**:
```
A silver medal icon with cosmic magical aura, 
second place medal, shining silver material with engraved number "2", 
cyan nebula background effect, star particles around it, 
fantasy game achievement icon, 3D render, metallic texture --ar 1:1 --v 6
```

**推奨プロンプト（銅メダル）**:
```
A bronze medal icon with cosmic magical aura, 
third place medal, shining bronze material with engraved number "3", 
orange nebula background effect, star particles around it, 
fantasy game achievement icon, 3D render, metallic texture --ar 1:1 --v 6
```

---

### 6. KPIアイコンセット（各ソーシャルメディア指標）

#### 6-1. インプレッション（Impressions）

**現在の状態**: 👁️ 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-impressions.png`

**推奨プロンプト**:
```
A mystical eye icon, cosmic iris with galaxy pattern inside, 
purple and cyan colors, glowing outline, magical vision symbol, 
fantasy game UI icon, dark background, ethereal glow, 
digital art, clean silhouette, spiritual appearance --ar 1:1 --v 6
```

#### 6-2. フォロワー増加（Follower Growth）

**現在の状態**: 👥 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-followers.png`

**推奨プロンプト**:
```
Multiple silhouette figures connected by glowing energy lines, 
network growth visualization, purple and pink gradient, 
cosmic particles, fantasy game social icon, 
growing community symbol, upward trending design, 
digital illustration, clean and modern --ar 1:1 --v 6
```

#### 6-3. プロフィールアクセス（Profile Access）

**現在の状態**: 📈 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-profile.png`

**推奨プロンプト**:
```
A user profile card icon with upward arrow, glowing border, 
cosmic magical particles, purple to cyan gradient, 
fantasy game profile icon, trending up symbol, 
clean design, neon glow effect, digital art --ar 1:1 --v 6
```

#### 6-4. インタラクション（Interactions）

**現在の状態**: 💬 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-interactions.png`

**推奨プロンプト**:
```
A magical speech bubble icon with sparkles, 
cosmic energy particles flowing around it, 
purple and gold gradient, communication symbol, 
fantasy game chat icon, glowing outline, 
vibrant neon effect, digital illustration --ar 1:1 --v 6
```

#### 6-5. X いいね数（X Likes）

**現在の状態**: ❤️ 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-likes.png`

**推奨プロンプト**:
```
A glowing heart icon with cosmic magical aura, 
pink to purple gradient, sparkles and star particles, 
fantasy game like button, ethereal glow, 
love and appreciation symbol, clean silhouette, 
vibrant neon colors, digital art --ar 1:1 --v 6
```

#### 6-6. X 返信数（X Replies）

**現在の状態**: 💭 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-replies.png`

**推奨プロンプト**:
```
A chain of connected thought bubbles, glowing with magical energy, 
cyan to purple gradient, cosmic particles between bubbles, 
conversation flow symbol, fantasy game reply icon, 
clean design, neon outline, digital illustration --ar 1:1 --v 6
```

#### 6-7. X 投稿数（X Posts）

**現在の状態**: 📝 絵文字  
**使用箇所**: レポート送信、詳細モーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/kpi-posts.png`

**推奨プロンプト**:
```
A magical feather quill writing on cosmic parchment, 
glowing ink trails with star particles, 
purple and gold gradient, creation symbol, 
fantasy game writing icon, ethereal paper, 
digital art, clean and elegant --ar 1:1 --v 6
```

---

### 7. ティアバッジアイコン（Tier Badges）

**現在の状態**: 🌱🥈🥇💎👑 絵文字  
**使用箇所**: ログインボーナスモーダル

**仕様**:
- **サイズ**: 512×512px（各）
- **ファイル形式**: PNG（透過背景）
- **保存先**:
  - `/public/images/ui/tier-normal.png` (初心者)
  - `/public/images/ui/tier-silver.png` (習慣化)
  - `/public/images/ui/tier-gold.png` (熟練者)
  - `/public/images/ui/tier-platinum.png` (達人)
  - `/public/images/ui/tier-diamond.png` (伝説)

**推奨プロンプト（初心者）**:
```
A small glowing seed badge, green sprout with magical aura, 
cosmic particles around it, beginner tier symbol, 
fantasy game rank icon, hope and growth theme, 
clean design, soft glow, digital art --ar 1:1 --v 6
```

**推奨プロンプト（習慣化）**:
```
A silver shield badge with glowing edges, 
engraved habit symbol, cosmic silver material, 
fantasy game rank icon, intermediate tier, 
metallic texture, star particles, digital art --ar 1:1 --v 6
```

**推奨プロンプト（熟練者）**:
```
A golden crown badge with magical aura, 
intricate golden design, cosmic gold material, 
fantasy game rank icon, advanced tier symbol, 
ray of light, divine appearance, digital art --ar 1:1 --v 6
```

**推奨プロンプト（達人）**:
```
A platinum diamond badge with rainbow aura, 
crystalline structure, cosmic purple glow, 
fantasy game rank icon, master tier symbol, 
prismatic light refraction, legendary appearance --ar 1:1 --v 6
```

**推奨プロンプト（伝説）**:
```
A cosmic crown badge with divine aura, 
cyan and gold energy flowing around it, 
ultimate tier symbol, godly appearance, 
fantasy game legendary rank icon, 
constellation pattern, maximum glow effect --ar 1:1 --v 6
```

---

### 8. ステータスアイコン（呪い状態）

**現在の状態**: ⚠️💀 絵文字  
**使用箇所**: マイページ、詳細モーダル（呪い状態表示）

**仕様**:
- **サイズ**: 256×256px（各）
- **ファイル形式**: PNG（透過背景）
- **保存先**:
  - `/public/images/ui/status-anxiety.png` (不安)
  - `/public/images/ui/status-weakness.png` (衰弱)
  - `/public/images/ui/status-cursed.png` (呪われし者)

**推奨プロンプト（不安）**:
```
A warning symbol with swirling dark energy, 
yellow to orange gradient, cautionary aura, 
fantasy game debuff icon, mild curse effect, 
dark particles, digital art, clean silhouette --ar 1:1 --v 6
```

**推奨プロンプト（衰弱）**:
```
A weakening symbol with dark purple energy, 
fading light effect, deterioration visual, 
fantasy game debuff icon, serious curse, 
shadowy particles, ominous atmosphere --ar 1:1 --v 6
```

**推奨プロンプト（呪われし者）**:
```
A cursed skull symbol with dark magical aura, 
black and purple energy, chains of darkness, 
fantasy game heavy debuff icon, ultimate curse, 
ominous glow, terrifying appearance, digital art --ar 1:1 --v 6
```

---

### 9. ログインボーナス関連アイコン

#### 9-1. カレンダーアイコン（Daily Login）

**現在の状態**: 📅 絵文字  
**使用箇所**: ログインボーナスモーダル

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/calendar-icon.png`

**推奨プロンプト**:
```
A mystical calendar icon with glowing date marks, 
cosmic purple and cyan colors, magical time symbol, 
fantasy game daily check icon, constellation pattern, 
ethereal glow, clean design, digital art --ar 1:1 --v 6
```

#### 9-2. 時計アイコン（Time Remaining）

**現在の状態**: ⏰ 絵文字  
**使用箇所**: ストリークリマインダー

**仕様**:
- **サイズ**: 256×256px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/clock-icon.png`

**推奨プロンプト**:
```
A mystical clock face with glowing cosmic hands, 
time magic symbol, purple and gold gradient, 
fantasy game time icon, star particles, 
ethereal clock design, urgent atmosphere, digital art --ar 1:1 --v 6
```

---

### 10. アクションボタン用アイコン

#### 10-1. 報告送信ボタン

**現在の状態**: なし（テキストのみ）  
**使用箇所**: レポート送信ボタン

**仕様**:
- **サイズ**: 128×128px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/submit-report-icon.png`

**推奨プロンプト**:
```
A glowing send icon, magical paper airplane with energy trail, 
purple and cyan gradient, cosmic particles, 
fantasy game submit button icon, upward motion, 
clean design, vibrant colors, digital art --ar 1:1 --v 6
```

#### 10-2. エナジー投資ボタン

**現在の状態**: なし（テキストのみ）  
**使用箇所**: エナジー投資モーダル

**仕様**:
- **サイズ**: 128×128px
- **ファイル形式**: PNG（透過背景）
- **保存先**: `/public/images/ui/invest-energy-icon.png`

**推奨プロンプト**:
```
A glowing energy transfer icon, magical orb flowing into guardian, 
purple and gold gradient, power infusion symbol, 
fantasy game energy investment icon, flowing particles, 
clean design, ethereal effect, digital art --ar 1:1 --v 6
```

---

## 📐 技術仕様まとめ

### ファイル命名規則
```
/public/images/ui/
  ├── energy-orb.png (512×512px)
  ├── energy-orb-small.png (256×256px)
  ├── energy-orb-large.png (1024×1024px)
  ├── total-energy-icon.png (256×256px)
  ├── cumulative-energy-icon.png (256×256px)
  ├── streak-flame.png (512×512px)
  ├── streak-flame-spark.png (512×512px)
  ├── streak-flame-blue.png (512×512px)
  ├── streak-flame-inferno.png (512×512px)
  ├── medal-gold.png (256×256px)
  ├── medal-silver.png (256×256px)
  ├── medal-bronze.png (256×256px)
  ├── kpi-impressions.png (256×256px)
  ├── kpi-followers.png (256×256px)
  ├── kpi-profile.png (256×256px)
  ├── kpi-interactions.png (256×256px)
  ├── kpi-likes.png (256×256px)
  ├── kpi-replies.png (256×256px)
  ├── kpi-posts.png (256×256px)
  ├── tier-normal.png (512×512px)
  ├── tier-silver.png (512×512px)
  ├── tier-gold.png (512×512px)
  ├── tier-platinum.png (512×512px)
  ├── tier-diamond.png (512×512px)
  ├── status-anxiety.png (256×256px)
  ├── status-weakness.png (256×256px)
  ├── status-cursed.png (256×256px)
  ├── calendar-icon.png (256×256px)
  ├── clock-icon.png (256×256px)
  ├── submit-report-icon.png (128×128px)
  └── invest-energy-icon.png (128×128px)
```

### 画像最適化ガイドライン

1. **エクスポート設定**:
   - ミッドジャーニー生成後、PNG形式でダウンロード
   - 背景は必ず透過（alpha channel）
   - 解像度は指定サイズの2倍で生成（Retina対応）

2. **圧縮**:
   - TinyPNG または ImageOptim で圧縮（60-80%品質）
   - ファイルサイズ目標: 50KB以下（大型512pxは150KB以下）

3. **CSSでの使用**:
   ```css
   .icon-energy {
     width: 48px;
     height: 48px;
     filter: drop-shadow(0 0 20px currentColor);
   }
   ```

4. **Next.js Image最適化**:
   ```tsx
   import Image from 'next/image';
   <Image 
     src="/images/ui/energy-orb.png" 
     alt="Energy" 
     width={48} 
     height={48}
     priority
   />
   ```

---

## 🎨 統一デザインガイドライン

### カラーパレット
- **プライマリ**: #A855F7 (紫)
- **セカンダリ**: #EC4899 (ピンク)
- **アクセント**: #22D3EE (シアン)
- **ゴールド**: #FBBF24 (金)
- **背景**: #020617 (漆黒)

### エフェクト統一
- **グロー**: `drop-shadow(0 0 20px rgba(168, 85, 247, 0.8))`
- **パーティクル**: 星のきらめき、魔法の粒子
- **マテリアル**: ガラス質、クリスタル、金属光沢

### アニメーション
- **浮遊**: 上下2-3秒周期
- **回転**: 20-30秒周期（ゆっくり）
- **パルス**: 1.5-2秒周期（呼吸するような）

---

## 📊 優先順位付け

### Phase 1（最優先）
1. エナジーオーブ（最も使用頻度が高い）
2. ストリーク炎アイコン（3バリエーション）
3. ランキングメダル（TOP 3視覚強化）

### Phase 2（高優先）
4. ティアバッジ（5種類）
5. KPIアイコンセット（7種類）

### Phase 3（通常優先）
6. ステータスアイコン（呪い状態3種類）
7. ログインボーナス関連（2種類）
8. アクションボタン用（2種類）

---

## 📝 実装チェックリスト

### 画像生成フェーズ
- [ ] ミッドジャーニーで全アイコン生成（合計30個）
- [ ] PNG透過背景でエクスポート
- [ ] 指定サイズにリサイズ
- [ ] 圧縮処理（TinyPNG）

### 実装フェーズ
- [ ] `/public/images/ui/` フォルダに配置
- [ ] 絵文字をPNG画像に差し替え（全箇所）
- [ ] Next.js Image コンポーネント使用
- [ ] CSSでグローエフェクト追加
- [ ] レスポンシブ対応確認

### テストフェーズ
- [ ] 全デバイスでの表示確認
- [ ] 読み込み速度テスト
- [ ] アニメーションの滑らかさ確認
- [ ] アクセシビリティ（alt text）確認

---

**作成者**: AI Assistant (Cline)  
**最終更新**: 2026/01/08 14:12  
**総アイコン数**: 30個  
**推定生成時間**: 2-3時間（ミッドジャーニー）  
**推定実装時間**: 4-5時間
