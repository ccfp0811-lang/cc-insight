/**
 * CC Insight v2: The Sovereign Command
 * リマインドメッセージ - 人間味のある自動通知システム
 * 
 * 【設計思想】
 * 1. ランダム性により「機械的」を回避
 * 2. 段階的な配信（gentle → supportive → urgent）
 * 3. ガーディアンシステムとの連携
 * 4. 菅原副社長の「温かい見守り」を体現
 */

export type MessageType = "gentle" | "supportive" | "urgent" | "followup" | "special";

export interface ReminderMessage {
  type: MessageType;
  message: string;
  title?: string;
}

// ===== メッセージプール =====

/**
 * 第1段階: 軽い声かけ（gentle）
 * タイミング: 19:30（日次）/ 金曜19:30（週次）
 * 目的: 「思い出させる」
 */
export const GENTLE_MESSAGES: ReminderMessage[] = [
  {
    type: "gentle",
    title: "📝 今日の報告",
    message: "今日も1日お疲れ様です🌙 報告、待ってますね！",
  },
  {
    type: "gentle",
    title: "✨ 成長の記録",
    message: "今日のあなたの頑張り、教えてください📝",
  },
  {
    type: "gentle",
    title: "💪 継続は力なり",
    message: "どんな小さな進捗でもOK！報告してくださいね✨",
  },
  {
    type: "gentle",
    title: "🔥 みんなの刺激",
    message: "あなたの報告、みんなの刺激になっています🔥",
  },
  {
    type: "gentle",
    title: "📊 今日も一歩",
    message: "今日も一歩前進！報告で記録に残しましょう💪",
  },
  {
    type: "gentle",
    title: "🌟 守護獣の成長",
    message: "あなたの守護獣が成長を待っています🐲✨",
  },
  {
    type: "gentle",
    title: "⭐ 経験値ゲット",
    message: "今日の報告で経験値ゲット！進化まであと少し！",
  },
];

/**
 * 第1段階（週次チーム用）: 週末の声かけ
 * タイミング: 金曜19:30
 */
export const WEEKLY_GENTLE_MESSAGES: ReminderMessage[] = [
  {
    type: "gentle",
    title: "📅 今週の報告",
    message: "今週の報告、お忘れなく📝 日曜までに提出してくださいね！",
  },
  {
    type: "gentle",
    title: "✨ 週の成果",
    message: "今週もお疲れ様です！週の成果をまとめて報告しましょう🌟",
  },
  {
    type: "gentle",
    title: "💪 継続中",
    message: "今週も頑張りましたね！日曜までに報告をお願いします📊",
  },
];

/**
 * 第2段階: 応援（supportive）
 * タイミング: 22:00（日次）/ 土曜19:30（週次）
 * 目的: 「最後の後押し」
 */
export const SUPPORTIVE_MESSAGES: ReminderMessage[] = [
  {
    type: "supportive",
    title: "⏰ もうすぐ締切",
    message: "忙しい日もありますよね。でも1分で報告できますよ📱",
  },
  {
    type: "supportive",
    title: "💡 簡単報告",
    message: "今日の報告、できそうですか？無理なく続けましょう！",
  },
  {
    type: "supportive",
    title: "📝 報告フォーム",
    message: "報告フォームはいつでも開けます👉 数字だけでもOK！",
  },
  {
    type: "supportive",
    title: "🙆 後からでもOK",
    message: "数字だけでもOK！コメントは後からでも大丈夫です🙆",
  },
  {
    type: "supportive",
    title: "🐲 守護獣待機中",
    message: "あなたの守護獣が成長を待っています🐲 今日の報告をお願いします✨",
  },
];

/**
 * 第2段階（週次チーム用）: 土曜の応援
 * タイミング: 土曜19:30
 */
export const WEEKLY_SUPPORTIVE_MESSAGES: ReminderMessage[] = [
  {
    type: "supportive",
    title: "⏰ 明日が締切",
    message: "明日が締切です！週の成果をまとめて報告しましょう✨",
  },
  {
    type: "supportive",
    title: "📊 週末のひととき",
    message: "週末のひとときに、今週の振り返りをお願いします🌟",
  },
  {
    type: "supportive",
    title: "💪 ラストスパート",
    message: "あと1日！今週の成果を報告して、素敵な日曜を迎えましょう😊",
  },
];

/**
 * 第3段階: 緊急（urgent）
 * タイミング: 日曜12:00（週次のみ）
 * 目的: 「最終リマインド」
 */
export const URGENT_MESSAGES: ReminderMessage[] = [
  {
    type: "urgent",
    title: "🚨 【最終】本日締切",
    message: "【最終】本日23:59が締切です！報告をお忘れなく🔥",
  },
  {
    type: "urgent",
    title: "⏰ ラストチャンス",
    message: "今日が締切日です！あと数時間、報告をお願いします📊",
  },
  {
    type: "urgent",
    title: "💪 最後の報告",
    message: "本日中に報告をお願いします！あなたの成果を記録しましょう✨",
  },
];

/**
 * フォローアップ: 翌朝の声かけ（caring）
 * タイミング: 翌朝8:00
 * 目的: 「状況確認と励まし」
 */
export const FOLLOWUP_MESSAGES: ReminderMessage[] = [
  {
    type: "followup",
    title: "☀️ おはようございます",
    message: "おはようございます☀️ 昨日は報告できなかったですね。大丈夫ですか？",
  },
  {
    type: "followup",
    title: "😊 体調は大丈夫？",
    message: "体調は平気ですか？無理しないでくださいね。今日からまた一緒に頑張りましょう！",
  },
  {
    type: "followup",
    title: "🌅 リスタート",
    message: "継続が途切れても大丈夫。また今日から始めましょう🌅",
  },
  {
    type: "followup",
    title: "💪 大丈夫",
    message: "1日休んでも、また続ければ大丈夫です💪 今日からリスタート！",
  },
  {
    type: "followup",
    title: "🔥 もう一度",
    message: "昨日は忙しかったのかな？今日からまた一緒に頑張りましょう🔥",
  },
];

/**
 * 特別メッセージ: 菅原副社長直筆風
 * タイミング: 特別な場面（離脱リスク高い、長期継続達成など）
 */
export const SPECIAL_MESSAGES: ReminderMessage[] = [
  {
    type: "special",
    title: "【菅原より】いつもありがとう",
    message: "【菅原より】いつも頑張ってくれてありがとう。今日の報告も待っています！",
  },
  {
    type: "special",
    title: "【菅原より】調子はどう？",
    message: "【菅原より】調子はどうですか？何か困っていたら相談してくださいね。",
  },
  {
    type: "special",
    title: "【菅原より】成長を感じる",
    message: "【菅原より】あなたの成長を日々感じています。これからも一緒に頑張りましょう！",
  },
  {
    type: "special",
    title: "【菅原より】大切なメンバー",
    message: "【菅原より】あなたはC-Creationの大切なメンバーです。応援しています！",
  },
];

// ===== メッセージ選択関数 =====

/**
 * ランダムにメッセージを選択
 */
export function getRandomMessage(type: MessageType, isWeekly: boolean = false): ReminderMessage {
  let pool: ReminderMessage[];
  
  switch (type) {
    case "gentle":
      pool = isWeekly ? WEEKLY_GENTLE_MESSAGES : GENTLE_MESSAGES;
      break;
    case "supportive":
      pool = isWeekly ? WEEKLY_SUPPORTIVE_MESSAGES : SUPPORTIVE_MESSAGES;
      break;
    case "urgent":
      pool = URGENT_MESSAGES;
      break;
    case "followup":
      pool = FOLLOWUP_MESSAGES;
      break;
    case "special":
      pool = SPECIAL_MESSAGES;
      break;
    default:
      pool = GENTLE_MESSAGES;
  }
  
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * パーソナライズされたメッセージを生成
 */
export function personalizeMessage(
  message: ReminderMessage,
  userData: {
    displayName: string;
    currentStreak?: number;
    guardianName?: string;
    lastReportDaysAgo?: number;
  }
): ReminderMessage {
  let personalizedMessage = message.message;
  let personalizedTitle = message.title || "";
  
  // 名前を挿入
  if (personalizedMessage.includes("{name}")) {
    personalizedMessage = personalizedMessage.replace("{name}", userData.displayName);
  }
  
  // ストリーク情報を強調
  if (userData.currentStreak && userData.currentStreak > 0) {
    if (message.type === "gentle") {
      personalizedMessage = `${userData.displayName}さん、${userData.currentStreak}日連続報告中！今日も記録更新しよう🔥`;
    }
  }
  
  // ガーディアン名を挿入
  if (userData.guardianName && personalizedMessage.includes("守護獣")) {
    personalizedMessage = personalizedMessage.replace("守護獣", userData.guardianName);
  }
  
  // 長期未報告者への特別配慮
  if (userData.lastReportDaysAgo && userData.lastReportDaysAgo >= 5 && message.type === "followup") {
    personalizedMessage = `${userData.displayName}さん、${userData.lastReportDaysAgo}日間報告がありませんね。何かあったら遠慮なく相談してください。一緒に解決しましょう！💪`;
    personalizedTitle = "【フォロー】ご状況確認";
  }
  
  return {
    ...message,
    message: personalizedMessage,
    title: personalizedTitle,
  };
}

/**
 * 送信履歴から適切なメッセージタイプを判定
 */
export function determineMessageType(
  lastReminderTime: Date | null,
  currentHour: number,
  isWeekly: boolean,
  dayOfWeek: number // 0=日, 1=月, ..., 6=土
): MessageType | null {
  if (isWeekly) {
    // 週次チーム
    if (dayOfWeek === 5 && currentHour === 19) return "gentle";      // 金曜19時
    if (dayOfWeek === 6 && currentHour === 19) return "supportive";  // 土曜19時
    if (dayOfWeek === 0 && currentHour === 12) return "urgent";      // 日曜12時
    if (dayOfWeek === 1 && currentHour === 8) return "followup";     // 月曜8時
  } else {
    // 日次チーム
    if (currentHour === 19) return "gentle";      // 当日19時
    if (currentHour === 22) return "supportive";  // 当日22時
    // 翌朝8時のフォローアップは別ロジックで判定
  }
  
  return null;
}

/**
 * 特別メッセージを送信すべきか判定
 */
export function shouldSendSpecialMessage(
  userData: {
    lastReportDaysAgo: number;
    totalReports: number;
    currentStreak: number;
  }
): boolean {
  // 5日以上未報告で、過去に20件以上報告がある場合（元アクティブユーザー）
  if (userData.lastReportDaysAgo >= 5 && userData.totalReports >= 20) {
    return true;
  }
  
  // 100日連続達成などの特別なマイルストーン
  if (userData.currentStreak === 100 || userData.currentStreak === 200 || userData.currentStreak === 365) {
    return true;
  }
  
  return false;
}

// ===== 配信ログ（将来的にFirestoreに保存） =====

export interface ReminderLog {
  userId: string;
  userEmail: string;
  teamId: string;
  messageType: MessageType;
  message: string;
  sentAt: Date;
  opened: boolean;
  responded: boolean; // 報告が提出されたか
}

/**
 * リマインダーの効果を分析
 */
export function analyzeReminderEffectiveness(logs: ReminderLog[]): {
  openRate: number;
  responseRate: number;
  mostEffectiveType: MessageType;
  leastEffectiveType: MessageType;
} {
  const byType: { [key in MessageType]?: { total: number; opened: number; responded: number } } = {};
  
  logs.forEach(log => {
    if (!byType[log.messageType]) {
      byType[log.messageType] = { total: 0, opened: 0, responded: 0 };
    }
    byType[log.messageType]!.total++;
    if (log.opened) byType[log.messageType]!.opened++;
    if (log.responded) byType[log.messageType]!.responded++;
  });
  
  const totalOpened = logs.filter(l => l.opened).length;
  const totalResponded = logs.filter(l => l.responded).length;
  
  const openRate = logs.length > 0 ? (totalOpened / logs.length) * 100 : 0;
  const responseRate = logs.length > 0 ? (totalResponded / logs.length) * 100 : 0;
  
  // 最も効果的/効果が薄いタイプを判定
  let mostEffectiveType: MessageType = "gentle";
  let leastEffectiveType: MessageType = "gentle";
  let highestRate = 0;
  let lowestRate = 100;
  
  Object.entries(byType).forEach(([type, stats]) => {
    if (stats.total === 0) return;
    const rate = (stats.responded / stats.total) * 100;
    if (rate > highestRate) {
      highestRate = rate;
      mostEffectiveType = type as MessageType;
    }
    if (rate < lowestRate) {
      lowestRate = rate;
      leastEffectiveType = type as MessageType;
    }
  });
  
  return {
    openRate: Math.round(openRate),
    responseRate: Math.round(responseRate),
    mostEffectiveType,
    leastEffectiveType,
  };
}
