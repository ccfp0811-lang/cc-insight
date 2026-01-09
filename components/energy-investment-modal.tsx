"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GUARDIANS,
  GuardianId,
  UserGuardianProfile,
  EVOLUTION_STAGES,
  getEnergyToNextStage,
  getAuraLevel,
  ATTRIBUTES,
  getPlaceholderStyle,
  getGuardianImagePath
} from "@/lib/guardian-collection";
import { investGuardianEnergy } from "@/lib/firestore";
import { Zap, X, TrendingUp, Sparkles, Star, Heart } from "lucide-react";

interface EnergyInvestmentModalProps {
  guardianId: GuardianId;
  profile: UserGuardianProfile;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// 投資成功時のメッセージを生成
function getSuccessMessage(amount: number, remaining: number | null, guardianName: string): { title: string; message: string; emoji: string } {
  if (remaining !== null && remaining <= 0) {
    return {
      title: "進化準備完了！",
      message: `${guardianName}が進化の光に包まれています...`,
      emoji: "✨"
    };
  }

  if (amount >= 100) {
    return {
      title: "大量投資！",
      message: `${guardianName}が力強く輝いています！`,
      emoji: "🔥"
    };
  }

  if (amount >= 50) {
    return {
      title: "素晴らしい投資！",
      message: `${guardianName}が喜んでいます！`,
      emoji: "💫"
    };
  }

  if (remaining !== null && remaining <= 50) {
    return {
      title: "あと少し！",
      message: `進化まであと${remaining}E！`,
      emoji: "🌟"
    };
  }

  return {
    title: "エナジー注入成功！",
    message: `${guardianName}が成長しています`,
    emoji: "💎"
  };
}

export default function EnergyInvestmentModal({
  guardianId,
  profile,
  userId,
  onClose,
  onSuccess
}: EnergyInvestmentModalProps) {
  const [investAmount, setInvestAmount] = useState(10);
  const [isInvesting, setIsInvesting] = useState(false);
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [evolutionData, setEvolutionData] = useState<{ from: number; to: number } | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState<{ amount: number; remaining: number | null; newInvested: number } | null>(null);

  const guardian = GUARDIANS[guardianId];
  const instance = profile.guardians[guardianId];
  const attr = ATTRIBUTES[guardian.attribute];
  const placeholder = getPlaceholderStyle(guardianId);
  
  if (!instance || !instance.unlocked) {
    return null;
  }

  const stage = instance.stage;
  const investedEnergy = instance.investedEnergy;
  const auraLevel = getAuraLevel(investedEnergy, stage);
  const nextStageInfo = getEnergyToNextStage(investedEnergy, guardianId);
  const currentEnergy = profile.energy.current;

  async function handleInvest() {
    if (investAmount <= 0 || investAmount > currentEnergy) {
      alert("エナジーが不足しています");
      return;
    }

    setIsInvesting(true);

    try {
      const result = await investGuardianEnergy(userId, guardianId, investAmount);
      
      if (result.success) {
        if (result.evolved) {
          // 進化演出を表示
          setEvolutionData({ from: stage, to: result.newStage });
          setShowEvolutionAnimation(true);

          // 3秒後に演出を閉じて成功コールバック
          setTimeout(() => {
            setShowEvolutionAnimation(false);
            onSuccess();
          }, 3000);
        } else {
          // 進化しなかった場合は成功演出を表示
          const newInvested = investedEnergy + investAmount;
          const newNextStageInfo = getEnergyToNextStage(newInvested, guardianId);
          setSuccessData({
            amount: investAmount,
            remaining: newNextStageInfo?.remaining ?? null,
            newInvested
          });
          setShowSuccessAnimation(true);

          // 2.5秒後に演出を閉じて成功コールバック
          setTimeout(() => {
            setShowSuccessAnimation(false);
            onSuccess();
          }, 2500);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error investing:", error);
      alert("エラーが発生しました");
    } finally {
      setIsInvesting(false);
    }
  }

  // 投資成功演出（進化なし）
  if (showSuccessAnimation && successData) {
    const successMsg = getSuccessMessage(successData.amount, successData.remaining, guardian.name);

    return (
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
          className="text-center px-8"
        >
          {/* エナジー吸収エフェクト */}
          <div className="relative mb-8">
            {/* 背景のグロー */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.5 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${attr.color}40, transparent)` }}
            />

            {/* 守護神アイコン */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.1, 1] }}
              transition={{ duration: 0.6, times: [0, 0.6, 1] }}
              className="w-40 h-40 mx-auto rounded-full flex items-center justify-center relative"
              style={{ background: placeholder.background }}
            >
              <span className="text-7xl">{placeholder.emoji}</span>

              {/* エナジー粒子 */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.05,
                    ease: "easeIn"
                  }}
                  className="absolute"
                >
                  <Zap className="w-6 h-6 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>

            {/* キラキラエフェクト */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 0.3 + i * 0.15,
                  repeat: 1,
                  repeatDelay: 0.5
                }}
                className="absolute"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`
                }}
              >
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </motion.div>
            ))}
          </div>

          {/* 投資額表示 */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <p className="text-6xl font-bold text-yellow-400 mb-2">
              +{successData.amount}E
            </p>
            <p className="text-xl text-gray-300">
              注入完了！
            </p>
          </motion.div>

          {/* メッセージ */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-5xl mb-3">{successMsg.emoji}</p>
            <h2 className="text-3xl font-bold text-white mb-2">
              {successMsg.title}
            </h2>
            <p className="text-xl text-gray-300">
              {successMsg.message}
            </p>
          </motion.div>

          {/* プログレスバー */}
          {successData.remaining !== null && successData.remaining > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="max-w-xs mx-auto"
            >
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>次の進化まで</span>
                <span className="text-yellow-400 font-bold">あと {successData.remaining}E</span>
              </div>
              <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((successData.newInvested) / (successData.newInvested + successData.remaining)) * 100)}%` }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // 進化演出中
  if (showEvolutionAnimation && evolutionData) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center"
        >
          {/* 進化エフェクト */}
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  `0 0 30px ${attr.color}40`,
                  `0 0 60px ${attr.color}80`,
                  `0 0 30px ${attr.color}40`
                ]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-64 h-64 rounded-full flex items-center justify-center mb-8"
              style={{ background: placeholder.background }}
            >
              <span className="text-9xl">{placeholder.emoji}</span>
            </motion.div>

            {/* キラキラエフェクト */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.2,
                  repeat: Infinity
                }}
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`
                }}
              >
                <Sparkles className="text-yellow-400 w-8 h-8" />
              </motion.div>
            ))}
          </div>

          {/* 進化メッセージ */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white"
          >
            <h2 className="text-4xl font-bold mb-4">
              🎉 進化成功！
            </h2>
            <p className="text-2xl mb-2">
              {guardian.name}が
            </p>
            <p className="text-3xl font-bold mb-2" style={{ color: attr.color }}>
              「{EVOLUTION_STAGES[evolutionData.to].name}」
            </p>
            <p className="text-2xl">
              に進化しました！
            </p>

            {evolutionData.to === 3 && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 p-4 bg-purple-900/50 rounded-lg"
              >
                <p className="text-yellow-400 font-bold">
                  ✨ 特性「{guardian.ability.name}」が解放されました！
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:pb-4 pb-[calc(var(--bottom-nav-height)+3rem)] z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 max-w-2xl w-full border-2 border-purple-500/30 max-h-[calc(100vh-var(--bottom-nav-height)-6rem)] md:max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {guardian.name}
              <span className="text-gray-400 text-sm ml-2">({guardian.reading})</span>
            </h2>
            <p className="text-gray-400 text-sm">{guardian.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* 守護神画像 */}
        <div 
          className="w-full aspect-square max-h-[30vh] rounded-xl mb-4 guardian-floating relative overflow-hidden"
          style={{ background: placeholder.background }}
        >
          <img
            src={getGuardianImagePath(guardianId, stage)}
            alt={guardian.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              // 画像読み込み失敗時はプレースホルダー表示
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center hidden">
            <span className="text-9xl">{placeholder.emoji}</span>
          </div>
          
          {/* 現在のステージバッジ */}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            <p className="text-xs text-gray-400">Stage</p>
            <p className="text-2xl font-bold" style={{ color: attr.color }}>
              {stage}
            </p>
          </div>
        </div>

        {/* 現在の状態 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">進化段階</p>
            <p className="text-lg font-bold text-white">
              {EVOLUTION_STAGES[stage].name}
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">投資済み</p>
            <p className="text-lg font-bold text-purple-400">
              {investedEnergy}E
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-xs text-gray-400 mb-1">オーラLv</p>
            <p className="text-lg font-bold text-pink-400">
              {auraLevel}%
            </p>
          </div>
        </div>

        {/* 次の進化まで */}
        {nextStageInfo && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-300">
                次の進化まで
              </p>
              <p className="text-lg font-bold text-yellow-400">
                あと {nextStageInfo.remaining}E
              </p>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(nextStageInfo.current / nextStageInfo.required) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 特性 */}
        <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
          <p className="text-sm text-purple-400 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            特性: {guardian.ability.name}
          </p>
          <p className="text-sm text-gray-400 mb-2">
            {guardian.ability.description}
          </p>
          {stage >= 3 ? (
            <p className="text-sm text-green-400 font-bold">✓ 発動中</p>
          ) : (
            <p className="text-sm text-yellow-400">Stage 3で解放</p>
          )}
        </div>

        {/* エナジー投資 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-white font-bold flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              投資するエナジー
            </label>
            <p className="text-gray-400">
              保有: <span className="text-yellow-400 font-bold">{currentEnergy}E</span>
            </p>
          </div>
          
          <input
            type="range"
            min="0"
            max={Math.min(currentEnergy, 500)}
            step="10"
            value={investAmount}
            onChange={(e) => setInvestAmount(parseInt(e.target.value))}
            className="w-full mb-3"
          />
          
          <div className="flex items-center justify-between mb-4">
            <input
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(Math.max(0, Math.min(currentEnergy, parseInt(e.target.value) || 0)))}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg w-32"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setInvestAmount(Math.min(currentEnergy, 10))}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                10
              </button>
              <button
                onClick={() => setInvestAmount(Math.min(currentEnergy, 50))}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                50
              </button>
              <button
                onClick={() => setInvestAmount(Math.min(currentEnergy, 100))}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                100
              </button>
              <button
                onClick={() => setInvestAmount(currentEnergy)}
                className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-sm"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* 投資ボタン */}
        <button
          onClick={handleInvest}
          disabled={isInvesting || investAmount <= 0 || investAmount > currentEnergy}
          className={`
            w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center
            ${investAmount > 0 && investAmount <= currentEnergy
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-slate-700 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isInvesting ? (
            <>処理中...</>
          ) : (
            <>
              <TrendingUp className="w-5 h-5 mr-2" />
              {investAmount}エナジーを注入する
            </>
          )}
        </button>
      </div>
    </div>
  );
}
