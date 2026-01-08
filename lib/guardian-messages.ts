/**
 * 守護神の状態適応型セリフシステム
 * ユーザーの現在の状態（順位、エナジー、呪い、ストリーク等）に応じて
 * 守護神のセリフが動的に変化する
 */

export interface UserState {
  energy: number;
  streak: number;
  curseState: "normal" | "anxiety" | "weakness" | "cursed";
  rank?: number; // 順位（1位、2位など）
  totalUsers?: number; // 総ユーザー数
  isTopTier?: boolean; // TOP 10%以内か
  earnedEnergy: number; // 今回獲得したエナジー
}

/**
 * ユーザーの状態に基づいて適切な守護神のセリフを選択
 */
export function getGuardianMessage(state: UserState): string {
  // 1. 呪い状態チェック（最優先）
  if (state.curseState === "cursed") {
    return selectRandom([
      "おかえり...長い間待っていたぞ。共に再び歩もう。",
      "やっと戻ってきたか。心配したぞ...だが、過去は問わない。",
      "暗闇から抜け出したな。お前の勇気を称えよう。",
    ]);
  }

  if (state.curseState === "weakness") {
    return selectRandom([
      "踏みとどまったな。さあ、ここから巻き返そう！",
      "よく戻ってきた。お前を信じていたぞ。",
      "立ち上がる姿、見事だ。共に強くなろう。",
    ]);
  }

  // 2. TOP層（絶好調）へのメッセージ
  if (state.isTopTier && state.energy > 1000) {
    return selectRandom([
      "圧倒的だ！お前は真の勝者だ！",
      "見事すぎる...お前と共にいられることが誇りだ！",
      "この調子だ！頂点への道を突き進め！",
      "完璧だ！お前の輝きが眩しいほどだ！",
    ]);
  }

  // 3. 高エナジー獲得（大成果）
  if (state.earnedEnergy >= 100) {
    return selectRandom([
      "素晴らしい成果だ！お前の努力が実を結んだ！",
      "驚異的だ...この力、まさに伝説級だ！",
      "見事すぎる！お前の本気を見せてもらった！",
    ]);
  }

  // 4. 長期ストリーク（30日以上）
  if (state.streak >= 30) {
    return selectRandom([
      "お前の継続力、まさに超人的だ！",
      "この絆、永遠に続くと信じている！",
      "完璧な習慣だ！共に歩み続けよう！",
    ]);
  }

  // 5. 中期ストリーク（7-29日）
  if (state.streak >= 7) {
    return selectRandom([
      "この調子だ！習慣が力になっている！",
      "よくやった！共に強くなっているぞ！",
      "見事だ！お前の覚悟が私を成長させる！",
    ]);
  }

  // 6. 通常時（標準的な励まし）
  return selectRandom([
    "よくやった！お前の努力は私の力になる！",
    "素晴らしい！共に強くなろう！",
    "見事だ！お前と共に歩めることを誇りに思う！",
    "完璧だ！我々の絆がさらに深まった！",
    "その調子だ！一緒に頂点を目指そう！",
  ]);
}

/**
 * ランダムに1つ選択
 */
function selectRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 守護神の「追加の一言」（セリフの後に表示される補足メッセージ）
 */
export function getGuardianSubMessage(state: UserState): string | null {
  // 呪いから回復した場合
  if (state.curseState === "weakness" || state.curseState === "cursed") {
    return "💎 解呪の儀式が完了した。お前の力が戻ってくる...";
  }

  // 大きなエナジー獲得
  if (state.earnedEnergy >= 100) {
    return "⚡ この力...凄まじいエナジーの奔流だ！";
  }

  // 長期ストリーク
  if (state.streak >= 30) {
    return "🔥 揺るぎない絆...これこそが真の強さだ！";
  }

  // TOP層
  if (state.isTopTier && state.energy > 1000) {
    return "👑 お前は既に伝説の領域にいる...";
  }

  return null;
}

/**
 * 呪い状態からの回復時の特別演出用メッセージ
 */
export function getCurseRecoveryMessage(daysGone: number): string {
  if (daysGone >= 7) {
    return "長い眠りから目覚めたな...だが、お前の魂は失われていなかった。";
  }
  if (daysGone >= 3) {
    return "暗闇の中、お前は道を見失わなかった。見事だ。";
  }
  return "一時の迷いなど、お前の力の前では些細なこと...";
}

/**
 * ストリーク記録更新時の特別メッセージ
 */
export function getStreakMilestoneMessage(streak: number): string | null {
  const milestones: Record<number, string> = {
    7: "🔥 7日連続達成！習慣の炎が燃え上がり始めた！",
    14: "💎 2週間連続！お前の意志は揺るぎない！",
    30: "👑 30日連続達成！伝説の領域へようこそ！",
    50: "⚡ 50日連続...もはや誰も止められない！",
    100: "🌟 100日連続...神話の世界だ！",
  };

  return milestones[streak] || null;
}
