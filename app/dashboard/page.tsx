"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // 全体サマリーは廃止。ランキングページへリダイレクト
    router.replace("/ranking");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
        <p className="text-slate-600">ランキングページへ移動中...</p>
      </div>
    </div>
  );
}
