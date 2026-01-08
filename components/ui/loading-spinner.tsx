/**
 * 🔄 統一ローディングコンポーネント
 * 全ページで一貫したローディング表示を提供
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

export function LoadingSpinner({ 
  size = "md", 
  text = "読み込み中...", 
  fullScreen = false,
  className 
}: LoadingSpinnerProps) {
  const spinner = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <Loader2 className={cn(sizeMap[size], "animate-spin text-pink-500")} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * ページ全体ローディング (フルスクリーン)
 */
export function PageLoader({ text = "読み込み中..." }: { text?: string }) {
  return <LoadingSpinner size="lg" text={text} fullScreen />;
}

/**
 * コンテンツローディング (インライン)
 */
export function ContentLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

/**
 * ボタンローディング (小サイズ)
 */
export function ButtonLoader() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}
