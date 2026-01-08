"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Calendar, TrendingUp, Award } from "lucide-react";
import { useEffect } from "react";
import type { LoginBonusResult } from "@/lib/daily-login-bonus";

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonusData: LoginBonusResult;
}

// ティア別の設定
const TIER_CONFIG = {
  normal: {
    color: "#10b981", // green
    gradient: "from-green-500 to-emerald-600",
    particles: 12,
  },
  silver: {
    color: "#94a3b8", // silver
    gradient: "from-slate-400 to-slate-600",
    particles: 16,
  },
  gold: {
    color: "#fbbf24", // gold
    gradient: "from-yellow-400 to-amber-600",
    particles: 20,
  },
  platinum: {
    color: "#a855f7", // purple
    gradient: "from-purple-500 to-pink-600",
    particles: 24,
  },
  diamond: {
    color: "#22d3ee", // cyan
    gradient: "from-cyan-400 to-blue-600",
    particles: 30,
  },
};

export function DailyLoginModal({ isOpen, onClose, bonusData }: DailyLoginModalProps) {
  const config = TIER_CONFIG[bonusData.tier];

  // バイブレーション
  useEffect(() => {
    if (isOpen && bonusData.isFirstLoginToday && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [isOpen, bonusData.isFirstLoginToday]);

  // 3.5秒後に自動クローズ
  useEffect(() => {
    if (isOpen && bonusData.isFirstLoginToday) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, bonusData.isFirstLoginToday, onClose]);

  if (!bonusData.isFirstLoginToday) {
    return null; // 既にログイン済みの場合は表示しない
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* 背景オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* パーティクル爆発 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(config.particles)].map((_, i) => {
              const angle = (i * 360) / config.particles;
              const radius = 150 + Math.random() * 100;
              const delay = i * 0.02;
              
              return (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 1, 
                    x: "50vw", 
                    y: "50vh", 
                    scale: 1,
                  }}
                  animate={{
                    opacity: [1, 1, 0],
                    x: `calc(50vw + ${Math.cos((angle * Math.PI) / 180) * radius}px)`,
                    y: `calc(50vh + ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
                    scale: [1, 1.5, 0],
                  }}
                  transition={{ 
                    duration: 1.2, 
                    delay,
                    ease: "easeOut"
                  }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${config.color}, #fbbf24)`,
                    boxShadow: `0 0 20px ${config.color}`,
                  }}
                />
              );
            })}
          </div>

          {/* メインコンテンツ */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.6
            }}
            className="relative z-10 glass-premium p-8 rounded-3xl border-2 max-w-md w-full"
            style={{
              borderColor: config.color,
              boxShadow: `0 0 60px ${config.color}80, 0 0 100px ${config.color}40`,
            }}
          >
            {/* 閉じるボタン */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* ヘッダー */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-6"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-8 h-8 text-cyan-400" />
                <h2 className="text-2xl font-bold text-cyan-400">
                  デイリーログインボーナス
                </h2>
              </div>
              {bonusData.isStreakBroken && (
                <p className="text-sm text-orange-400">ストリークが途切れました</p>
              )}
            </motion.div>

            {/* ティアアイコン＋連続日数 */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ 
                scale: [0.5, 1.2, 1],
                rotate: [0, 360, 360],
                opacity: 1,
              }}
              transition={{ 
                duration: 0.8,
                delay: 0.3,
              }}
              className="text-center mb-6"
            >
              <div className="text-8xl mb-3 relative inline-block">
                {bonusData.tier === "normal" && "🌱"}
                {bonusData.tier === "silver" && "🥈"}
                {bonusData.tier === "gold" && "🥇"}
                {bonusData.tier === "platinum" && "💎"}
                {bonusData.tier === "diamond" && "👑"}
                
                {/* 後光 */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full blur-3xl -z-10"
                  style={{ backgroundColor: config.color }}
                />
              </div>
              
              <div 
                className="text-sm font-bold mb-2"
                style={{ color: config.color }}
              >
                {bonusData.tier === "normal" && "初心者"}
                {bonusData.tier === "silver" && "習慣化"}
                {bonusData.tier === "gold" && "熟練者"}
                {bonusData.tier === "platinum" && "達人"}
                {bonusData.tier === "diamond" && "伝説"}
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-300">
                <TrendingUp className="w-5 h-5" style={{ color: config.color }} />
                <span className="text-3xl font-bold">{bonusData.consecutiveDays}</span>
                <span className="text-lg">日連続</span>
              </div>
            </motion.div>

            {/* エナジー獲得表示 */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-6"
            >
              <div className="flex items-center justify-center gap-3 mb-3">
                <Zap className="w-10 h-10 text-yellow-400" fill="#fbbf24" />
                <motion.p 
                  className={`text-6xl font-extrabold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  +{bonusData.energyEarned}
                </motion.p>
                <Zap className="w-10 h-10 text-yellow-400" fill="#fbbf24" />
              </div>
              <p className="text-xl font-bold text-yellow-400">
                エナジー獲得！
              </p>
            </motion.div>

            {/* メッセージ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-6"
            >
              <div
                className="p-4 rounded-xl relative overflow-hidden"
                style={{
                  backgroundColor: `${config.color}15`,
                  borderLeft: `4px solid ${config.color}`,
                }}
              >
                <p className="text-sm text-slate-200 text-center leading-relaxed">
                  {bonusData.message}
                </p>
              </div>
            </motion.div>

            {/* 次のティアまで */}
            {bonusData.nextTierIn > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="p-3 rounded-lg bg-slate-800/50 border border-slate-700"
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">次のティアまで</span>
                  </div>
                  <span className="font-bold text-cyan-400">
                    あと {bonusData.nextTierIn} 日
                  </span>
                </div>
              </motion.div>
            )}

            {/* プログレスバー */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 3.5, ease: "linear" }}
              className="mt-6 h-1 rounded-full origin-left"
              style={{ backgroundColor: config.color }}
            />

            {/* タップして閉じる */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center text-xs text-slate-400 mt-3"
            >
              タップして閉じる
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
