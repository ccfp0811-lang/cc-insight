"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Mail, RefreshCw, CheckCircle, LogOut } from "lucide-react";

export default function VerifyEmailPage() {
  const { user, userProfile, resendVerificationEmail, logout, refreshUserProfile } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  // 定期的にメール認証状態をチェック
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          await refreshUserProfile();
          router.push("/pending-approval");
        }
      }
    };

    const interval = setInterval(checkEmailVerification, 5000);
    return () => clearInterval(interval);
  }, [user, router, refreshUserProfile]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    try {
      await resendVerificationEmail();
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    try {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          await refreshUserProfile();
          router.push("/pending-approval");
        }
      }
    } catch (error) {
      console.error("Failed to check verification:", error);
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
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
            <Mail className="w-10 h-10 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">メール認証</h1>
          <p className="text-gray-400">確認メールをお送りしました</p>
        </div>

        {/* メインカード */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            {/* 送信先メール */}
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-gray-400 text-sm mb-1">送信先</p>
              <p className="text-white font-medium">{user?.email}</p>
            </div>

            {/* 説明文 */}
            <div className="text-gray-300 text-sm leading-relaxed">
              <p>
                上記のメールアドレスに確認メールを送信しました。
                メール内のリンクをクリックして、メールアドレスの認証を完了してください。
              </p>
            </div>

            {/* 再送成功メッセージ */}
            {resendSuccess && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4" />
                確認メールを再送しました
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-3">
              {/* 認証確認ボタン */}
              <Button
                onClick={handleCheckVerification}
                disabled={isChecking}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200"
              >
                {isChecking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    確認中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    認証を確認する
                  </div>
                )}
              </Button>

              {/* メール再送ボタン */}
              <Button
                onClick={handleResendEmail}
                disabled={isResending}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 py-3 rounded-xl transition-all duration-200"
              >
                {isResending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    送信中...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    確認メールを再送する
                  </div>
                )}
              </Button>
            </div>

            {/* 注意事項 */}
            <div className="text-gray-500 text-xs space-y-1">
              <p>※ メールが届かない場合は、迷惑メールフォルダをご確認ください</p>
              <p>※ 認証後、管理者の承認が完了するまでお待ちください</p>
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
            別のアカウントでログイン
          </button>
        </div>
      </div>
    </div>
  );
}
