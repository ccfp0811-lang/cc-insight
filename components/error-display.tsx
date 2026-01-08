"use client";

import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  severity?: "error" | "warning" | "info";
  title?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  severity = "error",
  title,
}: ErrorDisplayProps) {
  const config = {
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-400",
      glowColor: "rgba(239, 68, 68, 0.3)",
      emoji: "😰",
      defaultTitle: "エラーが発生しました",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-400",
      glowColor: "rgba(234, 179, 8, 0.3)",
      emoji: "⚠️",
      defaultTitle: "注意が必要です",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      glowColor: "rgba(59, 130, 246, 0.3)",
      emoji: "ℹ️",
      defaultTitle: "お知らせ",
    },
  }[severity];

  const Icon = config.icon;

  // エラーメッセージのユーザーフレンドリー変換
  const friendlyMessage = convertToFriendlyMessage(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-6 rounded-2xl border-2 ${config.bgColor} ${config.borderColor} relative overflow-hidden`}
      style={{
        boxShadow: `0 0 30px ${config.glowColor}`,
      }}
    >
      {/* 背景アニメーション */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
      />

      <div className="relative z-10 text-center space-y-4">
        {/* アイコン＋絵文字 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="text-5xl">{config.emoji}</div>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className={`w-12 h-12 ${config.textColor}`} />
          </motion.div>
        </motion.div>

        {/* タイトル */}
        <h3 className={`font-bold text-xl ${config.textColor}`}>
          {title || config.defaultTitle}
        </h3>

        {/* エラーメッセージ */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {friendlyMessage}
          </p>

          {/* 技術的詳細（開発用・折りたたみ可能） */}
          {process.env.NODE_ENV === "development" && error !== friendlyMessage && (
            <details className="text-xs text-slate-500 mt-2">
              <summary className="cursor-pointer hover:text-slate-400">
                技術的な詳細を表示
              </summary>
              <p className="mt-2 p-2 bg-black/30 rounded text-left font-mono">
                {error}
              </p>
            </details>
          )}
        </div>

        {/* リトライボタン */}
        {onRetry && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={onRetry}
              className={`bg-gradient-to-r ${
                severity === "error"
                  ? "from-red-500 to-pink-500"
                  : severity === "warning"
                  ? "from-yellow-500 to-orange-500"
                  : "from-blue-500 to-cyan-500"
              } text-white hover:opacity-90 transition-opacity`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              もう一度試す
            </Button>
          </motion.div>
        )}

        {/* ヘルプメッセージ */}
        <p className="text-xs text-slate-500 mt-4">
          問題が解決しない場合は、管理者にお問い合わせください。
        </p>
      </div>
    </motion.div>
  );
}

/**
 * エラーメッセージをユーザーフレンドリーに変換
 */
function convertToFriendlyMessage(error: string): string {
  const errorMap: Record<string, string> = {
    // タイムアウト系
    timeout: "通信に時間がかかっています。もう一度お試しください。",
    "タイムアウト": "通信に時間がかかっています。もう一度お試しください。",
    "timed out": "通信がタイムアウトしました。もう一度お試しください。",

    // ネットワーク系
    "network error": "インターネット接続を確認してください。",
    "fetch failed": "データの取得に失敗しました。インターネット接続を確認してください。",
    "failed to fetch": "データの取得に失敗しました。インターネット接続を確認してください。",

    // Firebase系
    "permission-denied": "権限がありません。管理者に連絡してください。",
    "not-found": "データが見つかりませんでした。",
    "already-exists": "既に存在しています。",
    "unauthenticated": "ログインが必要です。",

    // 一般的なエラー
    "undefined": "予期しないエラーが発生しました。もう一度お試しください。",
    "null": "データが見つかりませんでした。",
  };

  // エラーメッセージを小文字に変換してマッチング
  const lowerError = error.toLowerCase();

  for (const [key, value] of Object.entries(errorMap)) {
    if (lowerError.includes(key.toLowerCase())) {
      return value;
    }
  }

  // マッチしない場合は、元のメッセージをそのまま返す
  // ただし、技術的すぎる場合は一般化
  if (error.includes("Error:") || error.includes("Exception:")) {
    return "予期しないエラーが発生しました。もう一度お試しいただくか、管理者にお問い合わせください。";
  }

  return error;
}

/**
 * 小型版（インライン表示用）
 */
export function InlineError({
  message,
  severity = "error",
}: {
  message: string;
  severity?: "error" | "warning" | "info";
}) {
  const config = {
    error: {
      icon: AlertCircle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    info: {
      icon: Info,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  }[severity];

  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
      <p className={`text-sm ${config.color}`}>{convertToFriendlyMessage(message)}</p>
    </div>
  );
}
