"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface BrandedLoaderProps {
  message?: string;
  subMessage?: string;
  cosmic?: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
}

export function BrandedLoader({
  message = "読み込み中...",
  subMessage,
  cosmic = true,
  size = "md",
  color = "#a855f7", // デフォルト: 紫
}: BrandedLoaderProps) {
  const sizeConfig = {
    sm: {
      icon: 12,
      glow: 24,
      dots: 1.5,
      text: "text-sm",
      subText: "text-xs",
    },
    md: {
      icon: 16,
      glow: 32,
      dots: 2,
      text: "text-lg",
      subText: "text-xs",
    },
    lg: {
      icon: 20,
      glow: 40,
      dots: 2.5,
      text: "text-xl",
      subText: "text-sm",
    },
  }[size];

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 relative">
      {/* 星雲エフェクト */}
      {cosmic && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <motion.div
            className="rounded-full blur-3xl"
            style={{
              width: `${sizeConfig.glow * 4}px`,
              height: `${sizeConfig.glow * 4}px`,
              backgroundColor: `${color}20`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {/* 守護神シンボル回転 */}
      <div className="relative">
        <motion.div
          className="rounded-full flex items-center justify-center relative"
          style={{
            width: `${sizeConfig.icon * 5}px`,
            height: `${sizeConfig.icon * 5}px`,
            background: `linear-gradient(135deg, ${color}, #ec4899)`,
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <span
            className="text-white"
            style={{ fontSize: `${sizeConfig.icon * 1.5}px` }}
          >
            🛡️
          </span>
        </motion.div>

        {/* 外側リング（パルス） */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: `${color}30` }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />

        {/* 内側リング */}
        <motion.div
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: `${color}50` }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.3,
          }}
        />
      </div>

      {/* テキスト */}
      <div className="relative z-10 text-center space-y-2">
        <motion.p
          className={`font-medium text-gray-300 ${sizeConfig.text}`}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {message}
        </motion.p>

        {subMessage && (
          <motion.p
            className={`text-gray-500 ${sizeConfig.subText}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {subMessage}
          </motion.p>
        )}
      </div>

      {/* 3つのドット（バウンス） */}
      <div className="flex gap-2 relative z-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: `${sizeConfig.dots * 4}px`,
              height: `${sizeConfig.dots * 4}px`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}80`,
            }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 回転するルーン（6個） */}
      {cosmic && (
        <div className="absolute" style={{ width: "200px", height: "200px" }}>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white"
              style={{
                top: "50%",
                left: "50%",
                opacity: 0.6,
                boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * 100,
                  Math.cos(((angle + 360) * Math.PI) / 180) * 100,
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * 100,
                  Math.sin(((angle + 360) * Math.PI) / 180) * 100,
                ],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// シンプル版（小さなローディング用）
export function SimpleLoader({ color = "#a855f7" }: { color?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="w-8 h-8 border-3 border-t-transparent rounded-full"
        style={{ borderColor: color, borderTopColor: "transparent" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
