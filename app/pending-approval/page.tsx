"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, CheckCircle, LogOut, User, Users } from "lucide-react";

const teamNames: { [key: string]: string } = {
  fukugyou: "副業チーム",
  taishoku: "退職サポートチーム",
  buppan: "スマホ物販チーム",
};

const teamColors: { [key: string]: string } = {
  fukugyou: "#ec4899",
  taishoku: "#06b6d4",
  buppan: "#eab308",
};

export default function PendingApprovalPage() {
  const { user, userProfile, logout, refreshUserProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  // 定期的に承認状態をチェック
  useEffect(() => {
    const checkApprovalStatus = async () => {
      await refreshUserProfile();
    };

    const interval = setInterval(checkApprovalStatus, 10000);
    return () => clearInterval(interval);
  }, [refreshUserProfile]);

  // 承認済みになったらダッシュボードへ
  useEffect(() => {
    if (userProfile?.status === "approved") {
      router.push("/dashboard");
    }
  }, [userProfile, router]);

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await refreshUserProfile();
      if (userProfile?.status === "approved") {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* アイコン */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 mb-4 relative">
            <Clock className="w-10 h-10 text-yellow-400" />
            {/* パルスアニメーション */}
            <span className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">承認待ち</h1>
          <p className="text-gray-400">管理者の承認をお待ちください</p>
        </div>

        {/* メインカード */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            {/* ユーザー情報 */}
            <div className="space-y-3">
              {/* 名前 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">表示名</p>
                    <p className="text-white font-medium">{userProfile?.displayName || user?.displayName}</p>
                  </div>
                </div>
              </div>

              {/* チーム */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-xs">所属チーム</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: userProfile?.team ? teamColors[userProfile.team] : "#888" }}
                      />
                      <p className="text-white font-medium">
                        {userProfile?.team ? teamNames[userProfile.team] : "未設定"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ステータス */}
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                <div>
                  <p className="text-yellow-400 font-medium">承認待ち</p>
                  <p className="text-gray-400 text-sm">
                    メール認証が完了しました。管理者が承認するまでお待ちください。
                  </p>
                </div>
              </div>
            </div>

            {/* 説明文 */}
            <div className="text-gray-300 text-sm leading-relaxed text-center">
              <p>
                登録内容を確認後、管理者が承認を行います。
                承認が完了すると、自動的にダッシュボードへ移動します。
              </p>
            </div>

            {/* アクションボタン */}
            <div className="space-y-3">
              {/* ステータス確認ボタン */}
              <Button
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-medium py-3 rounded-xl transition-all duration-200"
              >
                {isChecking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    確認中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    承認状態を確認
                  </div>
                )}
              </Button>
            </div>

            {/* 注意事項 */}
            <div className="text-gray-500 text-xs text-center space-y-1">
              <p>※ 通常、承認は24時間以内に行われます</p>
              <p>※ 承認されると自動的にダッシュボードへ移動します</p>
            </div>
          </div>
        </div>

        {/* ログアウトリンク */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-300 text-sm flex items-center gap-2 mx-auto transition-colors"
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </button>
        </div>

        {/* 進捗インジケーター */}
        <div className="mt-8">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">登録完了</span>
            </div>
            <div className="w-8 h-0.5 bg-green-400" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-gray-400">メール認証</span>
            </div>
            <div className="w-8 h-0.5 bg-yellow-400" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-medium">承認待ち</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
