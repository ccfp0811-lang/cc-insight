/**
 * C-Creation 守護神経済圏（Game Economy）
 * 
 * SNS成果を「生命線」とする、冷徹かつ情熱的なゲームバランス
 * 
 * 数式: TotalEnergy = (Base + (KPI × α)^1.5 + QuestBonus) × Streak × Curse × Gacha
 * 格差: 提出のみ（5E）vs 伝説（1000E超）= 200倍以上
 */

// ========================================
// 🔢 KPI係数設定
// ========================================
export const KPI_COEFFICIENTS = {
  // Shorts系（副業/退職サポート）
  shorts: {
    impressions: 0.0001,      // 1万再生 = 1
    profileAccess: 0.01,      // 100アクセス = 1
    followerGrowth: 0.1,      // 10人増 = 1
    interactions: 0.001,      // 1000インタラクション = 1
  },
  // X系（物販チーム）
  x: {
    likes: 0.01,              // 100いいね = 1
    replies: 0.02,            // 50リプライ = 1
    posts: 0.5,               // 2投稿 = 1
  }
} as const;

// ========================================
// 🛡️ 呪い状態（Curse State）
// ========================================
export type CurseLevel = 'normal' | 'anxiety' | 'weakness' | 'cursed';

export interface CurseState {
  level: CurseLevel;
  daysWithoutSubmission: number;
  multiplier: number;
  visualEffect: string;
  guardianMood: string;
  message: string;
  recoveryProgress: number;  // 解呪進捗（0-3）
}

export const CURSE_STATES: Record<CurseLevel, Omit<CurseState, 'daysWithoutSubmission' | 'recoveryProgress'>> = {
  normal: {
    level: 'normal',
    multiplier: 1.0,
    visualEffect: 'full_glow',
    guardianMood: 'happy',
    message: '絶好調だ！一緒に頑張ろう！'
  },
  anxiety: {
    level: 'anxiety',
    multiplier: 0.9,
    visualEffect: 'slight_dim',
    guardianMood: 'worried',
    message: '...今日は報告がなかった。大丈夫？'
  },
  weakness: {
    level: 'weakness',
    multiplier: 0.6,
    visualEffect: 'flickering',
    guardianMood: 'weak',
    message: '力が...抜けていく...'
  },
  cursed: {
    level: 'cursed',
    multiplier: 0.2,
    visualEffect: 'grayscale_100',
    guardianMood: 'collapsed',
    message: '呪いに蝕まれている...助けて...'
  }
};

// ========================================
// 🎰 カムバック・ガチャ
// ========================================
export type GachaResultType = 'triple' | 'double' | 'protection' | 'miss';

export interface GachaResult {
  type: GachaResultType;
  multiplier: number;
  probability: number;
  message: string;
  emoji: string;
}

export const GACHA_TABLE: GachaResult[] = [
  {
    type: 'triple',
    multiplier: 3.0,
    probability: 10,
    message: '守護神が黄金の宝箱を見つけた！明日3倍！',
    emoji: '🌟'
  },
  {
    type: 'double',
    multiplier: 2.0,
    probability: 20,
    message: '幸運の風が吹いた！明日2倍！',
    emoji: '✨'
  },
  {
    type: 'protection',
    multiplier: 1.0,
    probability: 20,
    message: '守護神がストリークを守ってくれた！',
    emoji: '🛡️'
  },
  {
    type: 'miss',
    multiplier: 1.0,
    probability: 50,
    message: '守護神は静かに見守っている...',
    emoji: '💭'
  }
];

// ========================================
// 🎯 ギルド・クエスト
// ========================================
export interface GuildQuest {
  id: string;
  title: string;
  description: string;
  targetKPI: string;
  targetValue: number;
  bonusEnergy: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdBy: string;
  teamTypes?: ('shorts' | 'x')[];  // 対象チームタイプ
}

// ========================================
// 📊 KPIデータ型
// ========================================
export interface ShortsKPI {
  type: 'shorts';
  impressions: number;
  profileAccess: number;
  followerGrowth: number;
  interactions: number;
}

export interface XKPI {
  type: 'x';
  likes: number;
  replies: number;
  posts: number;
}

export type KPIData = ShortsKPI | XKPI;

// ========================================
// 📈 エナジー計算結果
// ========================================
export interface EnergyCalculation {
  base: number;
  kpiScore: number;
  kpiPowered: number;
  questBonus: number;
  subtotal: number;
  streakMultiplier: number;
  curseMultiplier: number;
  gachaMultiplier: number;
  total: number;
  breakdown: string;
}

// ========================================
// 🔢 基礎定数
// ========================================
const BASE_ENERGY = 5;  // 提出のみの微量報酬
const EXPONENT = 1.5;   // 指数関数の累乗
const MAX_STREAK_DAYS = 30;
const STREAK_BONUS_PER_DAY = 0.1;

// ========================================
// 🧮 KPIスコア計算
// ========================================
export function calculateKPIScore(kpi: KPIData): number {
  if (kpi.type === 'shorts') {
    return (
      kpi.impressions * KPI_COEFFICIENTS.shorts.impressions +
      kpi.profileAccess * KPI_COEFFICIENTS.shorts.profileAccess +
      kpi.followerGrowth * KPI_COEFFICIENTS.shorts.followerGrowth +
      kpi.interactions * KPI_COEFFICIENTS.shorts.interactions
    );
  } else {
    return (
      kpi.likes * KPI_COEFFICIENTS.x.likes +
      kpi.replies * KPI_COEFFICIENTS.x.replies +
      kpi.posts * KPI_COEFFICIENTS.x.posts
    );
  }
}

// ========================================
// 📈 指数関数的成果報酬
// ========================================
export function calculatePoweredScore(kpiScore: number): number {
  if (kpiScore <= 0) return 0;
  return Math.pow(kpiScore, EXPONENT);
}

// ========================================
// 🔥 ストリーク倍率計算
// ========================================
export function calculateStreakMultiplier(streakDays: number): number {
  const cappedDays = Math.min(streakDays, MAX_STREAK_DAYS);
  return 1 + (cappedDays * STREAK_BONUS_PER_DAY);  // 最大 4.0倍
}

// ========================================
// 😰 呪い状態の判定
// ========================================
export function getCurseState(daysWithoutSubmission: number): CurseState {
  let level: CurseLevel;
  
  if (daysWithoutSubmission === 0) {
    level = 'normal';
  } else if (daysWithoutSubmission === 1) {
    level = 'anxiety';
  } else if (daysWithoutSubmission === 2) {
    level = 'weakness';
  } else {
    level = 'cursed';
  }
  
  return {
    ...CURSE_STATES[level],
    daysWithoutSubmission,
    recoveryProgress: 0
  };
}

// ========================================
// 🙏 解呪（禊）の試行
// ========================================
export function attemptCurseRecovery(
  currentCurse: CurseState,
  consecutiveSubmissions: number
): CurseState {
  // 正常状態なら何もしない
  if (currentCurse.level === 'normal') {
    return currentCurse;
  }
  
  // 呪い状態からの完全回復には3日連続報告が必要
  if (currentCurse.level === 'cursed') {
    if (consecutiveSubmissions >= 3) {
      return { ...CURSE_STATES.normal, daysWithoutSubmission: 0, recoveryProgress: 3 };
    }
    return { ...currentCurse, recoveryProgress: consecutiveSubmissions };
  }
  
  // 衰弱状態からの回復には2日連続報告
  if (currentCurse.level === 'weakness') {
    if (consecutiveSubmissions >= 2) {
      return { ...CURSE_STATES.normal, daysWithoutSubmission: 0, recoveryProgress: 2 };
    }
    return { ...currentCurse, recoveryProgress: consecutiveSubmissions };
  }
  
  // 不安状態からの回復には1日報告
  if (currentCurse.level === 'anxiety') {
    if (consecutiveSubmissions >= 1) {
      return { ...CURSE_STATES.normal, daysWithoutSubmission: 0, recoveryProgress: 1 };
    }
  }
  
  return currentCurse;
}

// ========================================
// 🎰 カムバック・ガチャの実行
// ========================================
export function rollComebackGacha(): GachaResult {
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (const result of GACHA_TABLE) {
    cumulative += result.probability;
    if (roll < cumulative) {
      return result;
    }
  }
  
  return GACHA_TABLE[GACHA_TABLE.length - 1];  // フォールバック
}

// ========================================
// 🎯 クエストボーナス計算
// ========================================
export function calculateQuestBonus(
  kpi: KPIData,
  activeQuests: GuildQuest[]
): number {
  let bonus = 0;
  
  for (const quest of activeQuests) {
    if (!quest.isActive) continue;
    
    // チームタイプが指定されていれば確認
    if (quest.teamTypes && !quest.teamTypes.includes(kpi.type)) continue;
    
    // 現在の日付がクエスト期間内か確認
    const now = new Date();
    if (now < quest.startDate || now > quest.endDate) continue;
    
    // KPI達成判定
    let achieved = false;
    
    if (kpi.type === 'shorts') {
      switch (quest.targetKPI) {
        case 'impressions':
          achieved = kpi.impressions >= quest.targetValue;
          break;
        case 'profileAccess':
          achieved = kpi.profileAccess >= quest.targetValue;
          break;
        case 'followerGrowth':
          achieved = kpi.followerGrowth >= quest.targetValue;
          break;
        case 'interactions':
          achieved = kpi.interactions >= quest.targetValue;
          break;
      }
    } else {
      switch (quest.targetKPI) {
        case 'likes':
          achieved = kpi.likes >= quest.targetValue;
          break;
        case 'replies':
          achieved = kpi.replies >= quest.targetValue;
          break;
        case 'posts':
          achieved = kpi.posts >= quest.targetValue;
          break;
      }
    }
    
    if (achieved) {
      bonus += quest.bonusEnergy;
    }
  }
  
  return bonus;
}

// ========================================
// 💎 メインエナジー計算関数
// ========================================
export function calculateTotalEnergy(
  submitted: boolean,
  kpi: KPIData | null,
  streakDays: number,
  curseState: CurseState,
  gachaMultiplier: number = 1.0,
  activeQuests: GuildQuest[] = []
): EnergyCalculation {
  // 未提出の場合
  if (!submitted || !kpi) {
    return {
      base: 0,
      kpiScore: 0,
      kpiPowered: 0,
      questBonus: 0,
      subtotal: 0,
      streakMultiplier: 1,
      curseMultiplier: curseState.multiplier,
      gachaMultiplier: 1,
      total: 0,
      breakdown: '未提出 - エナジー獲得なし'
    };
  }
  
  // 各要素の計算
  const base = BASE_ENERGY;
  const kpiScore = calculateKPIScore(kpi);
  const kpiPowered = calculatePoweredScore(kpiScore);
  const questBonus = calculateQuestBonus(kpi, activeQuests);
  const subtotal = base + kpiPowered + questBonus;
  const streakMultiplier = calculateStreakMultiplier(streakDays);
  const curseMultiplier = curseState.multiplier;
  
  // 🔧 浮動小数点誤差対策: 整数演算に変換して計算
  // 1000倍して整数化 → 計算 → 1000で割ってMath.floor
  const PRECISION = 1000;
  const subtotalInt = Math.round(subtotal * PRECISION);
  const streakInt = Math.round(streakMultiplier * PRECISION);
  const curseInt = Math.round(curseMultiplier * PRECISION);
  const gachaInt = Math.round(gachaMultiplier * PRECISION);

  // 整数演算で計算（精度を保つ）
  const totalInt = Math.floor(
    (subtotalInt * streakInt * curseInt * gachaInt) / (PRECISION * PRECISION * PRECISION)
  );

  const total = totalInt;
  
  // 内訳テキスト生成
  const breakdown = `
基礎報酬: ${base}E
KPI成果: ${kpiScore.toFixed(2)} → ${kpiPowered.toFixed(1)}E (^1.5)
クエストボーナス: ${questBonus}E
小計: ${subtotal.toFixed(1)}E
× ストリーク(${streakDays}日): ×${streakMultiplier.toFixed(1)}
× 呪い(${curseState.level}): ×${curseMultiplier}
× ガチャ: ×${gachaMultiplier}
━━━━━━━━━━━━━━━━━━
合計: ${total}E
  `.trim();
  
  return {
    base,
    kpiScore,
    kpiPowered,
    questBonus,
    subtotal,
    streakMultiplier,
    curseMultiplier,
    gachaMultiplier,
    total,
    breakdown
  };
}

// ========================================
// 📊 シミュレーション関数（テスト用）
// ========================================
export function simulateEnergyScenarios(): void {
  const scenarios = [
    { name: '提出のみ', impressions: 0 },
    { name: '平均', impressions: 10000 },
    { name: '良好', impressions: 50000 },
    { name: '爆発', impressions: 100000 },
    { name: '伝説', impressions: 500000 },
  ];
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 エナジー獲得シミュレーション（Shorts系）');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  for (const scenario of scenarios) {
    const kpi: ShortsKPI = {
      type: 'shorts',
      impressions: scenario.impressions,
      profileAccess: scenario.impressions / 100,
      followerGrowth: scenario.impressions / 10000,
      interactions: scenario.impressions / 10
    };
    
    const result = calculateTotalEnergy(
      true,
      kpi,
      10,  // 10日連続
      getCurseState(0),  // 正常状態
      1.0,  // ガチャなし
      []
    );
    
    console.log(`\n【${scenario.name}】再生数: ${scenario.impressions.toLocaleString()}`);
    console.log(`→ 合計: ${result.total}E`);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('格差: 提出のみ vs 伝説 = 200倍以上');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}
