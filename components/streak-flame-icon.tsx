"use client";

import { getStreakFlameData } from "@/lib/streak-system";

/**
 * 🔥 ストリーク炎アイコン
 * 
 * ランキング・マイページで表示される進化する炎
 * 社会的証明の視覚的表現
 */

interface StreakFlameIconProps {
  currentStreak: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StreakFlameIcon({ 
  currentStreak, 
  size = "md", 
  showCount = true,
  className = "" 
}: StreakFlameIconProps) {
  // ストリークが0なら表示しない
  if (currentStreak === 0) return null;

  const flameData = getStreakFlameData(currentStreak);

  // サイズ設定
  const sizeClasses = {
    sm: {
      container: "w-8 h-8",
      emoji: "text-lg",
      count: "text-xs"
    },
    md: {
      container: "w-10 h-10",
      emoji: "text-xl",
      count: "text-sm"
    },
    lg: {
      container: "w-14 h-14",
      emoji: "text-3xl",
      count: "text-base"
    }
  };

  const sizeClass = sizeClasses[size];

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      {/* 炎アイコン */}
      <div 
        className={`${sizeClass.container} rounded-full flex items-center justify-center relative transition-all duration-300`}
        style={{
          backgroundColor: `${flameData.color}20`,
          boxShadow: flameData.shouldAnimate 
            ? `0 0 20px ${flameData.glowColor}, 0 0 40px ${flameData.glowColor}80`
            : `0 0 10px ${flameData.glowColor}`,
          border: `2px solid ${flameData.color}`,
        }}
      >
        {/* アニメーション効果（30日以上） */}
        {flameData.shouldAnimate && (
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{
              backgroundColor: flameData.color,
            }}
          />
        )}
        
        {/* 炎絵文字 */}
        <span 
          className={`${sizeClass.emoji} relative z-10 ${flameData.shouldAnimate ? 'animate-pulse' : ''}`}
          style={{
            filter: `drop-shadow(0 0 4px ${flameData.color})`
          }}
        >
          {flameData.emoji}
        </span>
      </div>

      {/* 連続日数表示 */}
      {showCount && (
        <div className="flex flex-col items-start">
          <span 
            className={`${sizeClass.count} font-bold leading-none`}
            style={{ color: flameData.color }}
          >
            {currentStreak}日
          </span>
          <span className="text-xs text-slate-500 leading-none">
            連続
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * 🔥 ストリーク炎バッジ（ツールチップ付き）
 * 
 * ランキング表示用の詳細情報付きバッジ
 */

interface StreakFlameBadgeProps {
  currentStreak: number;
  maxStreak?: number;
  size?: "sm" | "md" | "lg";
}

export function StreakFlameBadge({ 
  currentStreak, 
  maxStreak,
  size = "md" 
}: StreakFlameBadgeProps) {
  if (currentStreak === 0) return null;

  const flameData = getStreakFlameData(currentStreak);

  return (
    <div className="group relative inline-block">
      {/* メインアイコン */}
      <StreakFlameIcon 
        currentStreak={currentStreak} 
        size={size} 
        showCount={false} 
      />

      {/* ツールチップ（ホバー時） */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div 
          className="whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium shadow-xl border-2"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.98)",
            borderColor: flameData.color,
            boxShadow: `0 0 15px ${flameData.glowColor}`
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{flameData.emoji}</span>
            <span 
              className="font-bold"
              style={{ color: flameData.color }}
            >
              {flameData.tierName}
            </span>
          </div>
          <div className="text-slate-300">
            現在: <span className="font-bold" style={{ color: flameData.color }}>{currentStreak}日連続</span>
          </div>
          {maxStreak && maxStreak > currentStreak && (
            <div className="text-slate-400 text-xs mt-1">
              最高記録: {maxStreak}日
            </div>
          )}
          
          {/* 次の段階への進捗 */}
          {currentStreak < 7 && (
            <div className="text-slate-400 text-xs mt-1">
              💎 青炎まであと{7 - currentStreak}日
            </div>
          )}
          {currentStreak >= 7 && currentStreak < 30 && (
            <div className="text-slate-400 text-xs mt-1">
              👑 煌めきまであと{30 - currentStreak}日
            </div>
          )}
        </div>
        {/* 三角形の矢印 */}
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: `6px solid ${flameData.color}`,
            filter: `drop-shadow(0 2px 4px ${flameData.glowColor})`
          }}
        />
      </div>
    </div>
  );
}

/**
 * 🔥 ストリーク比較表示
 * 
 * 2つのストリークを並べて比較表示
 * マイページでの「今週 vs 先週」などに使用
 */

interface StreakComparisonProps {
  current: {
    label: string;
    streak: number;
  };
  previous: {
    label: string;
    streak: number;
  };
}

export function StreakComparison({ current, previous }: StreakComparisonProps) {
  const currentFlame = getStreakFlameData(current.streak);
  const previousFlame = getStreakFlameData(previous.streak);
  
  const improvement = current.streak - previous.streak;
  const isImproved = improvement > 0;
  const isDeclined = improvement < 0;

  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700">
      {/* 現在 */}
      <div className="flex items-center gap-3">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${currentFlame.color}20`,
            boxShadow: `0 0 15px ${currentFlame.glowColor}`,
            border: `2px solid ${currentFlame.color}`,
          }}
        >
          {currentFlame.emoji}
        </div>
        <div>
          <div className="text-xs text-slate-400">{current.label}</div>
          <div 
            className="text-2xl font-bold"
            style={{ color: currentFlame.color }}
          >
            {current.streak}日
          </div>
        </div>
      </div>

      {/* 比較矢印 */}
      <div className="flex flex-col items-center">
        {isImproved && (
          <>
            <span className="text-green-400 text-2xl">↗️</span>
            <span className="text-green-400 text-xs font-bold">+{improvement}</span>
          </>
        )}
        {isDeclined && (
          <>
            <span className="text-red-400 text-2xl">↘️</span>
            <span className="text-red-400 text-xs font-bold">{improvement}</span>
          </>
        )}
        {!isImproved && !isDeclined && (
          <>
            <span className="text-slate-500 text-2xl">→</span>
            <span className="text-slate-500 text-xs font-bold">±0</span>
          </>
        )}
      </div>

      {/* 前回 */}
      <div className="flex items-center gap-3">
        <div>
          <div className="text-xs text-slate-400">{previous.label}</div>
          <div 
            className="text-2xl font-bold"
            style={{ color: previousFlame.color }}
          >
            {previous.streak}日
          </div>
        </div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl opacity-60"
          style={{
            backgroundColor: `${previousFlame.color}20`,
            border: `2px solid ${previousFlame.color}`,
          }}
        >
          {previousFlame.emoji}
        </div>
      </div>
    </div>
  );
}
