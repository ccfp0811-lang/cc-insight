"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword, Mail, Lock, AlertCircle, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";

export default function MemberLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-credential") {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else if (err.code === "auth/user-not-found") {
        setError("ユーザーが見つかりません");
      } else if (err.code === "auth/wrong-password") {
        setError("パスワードが正しくありません");
      } else if (err.message.includes("停止")) {
        setError(err.message);
      } else {
        setError("ログインに失敗しました。もう一度お試しください。");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 p-4 relative overflow-hidden">
      {/* RPG風背景エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* キラキラエフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute text-pink-400/30 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>

      <Card className="w-full max-w-md relative bg-black/40 backdrop-blur-xl border-2 border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
        <CardHeader className="text-center space-y-4">
          {/* RPG風アイコン */}
          <div className="mx-auto mb-2 relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.6)] animate-pulse">
              <Sword className="w-10 h-10 text-white" />
            </div>
            {/* グローエフェクト */}
            <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 blur-xl opacity-50 animate-ping" />
          </div>

          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent mb-2">
              CC Insight
            </CardTitle>
            <CardDescription className="text-lg text-pink-300 font-semibold">
              🎮 冒険者ログイン
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              あなたの成長の記録がここに
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border-2 border-red-500/50 flex items-center gap-2 text-red-300 text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-pink-200">メールアドレス</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-2 border-pink-500/30 focus:border-pink-500 text-white placeholder:text-gray-500 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-pink-200">パスワード</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-2 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-gray-500 h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-bold text-lg hover:opacity-90 shadow-[0_0_30px_rgba(236,72,153,0.5)] relative overflow-hidden group"
              disabled={loading}
            >
              {/* ホバー時のアニメーション */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    冒険の扉を開いています...
                  </>
                ) : (
                  <>
                    <Sword className="w-5 h-5" />
                    冒険を始める
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* 新規登録リンク */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-pink-500/30" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black/40 text-muted-foreground">または</span>
            </div>
          </div>

          <Link href="/register">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2 border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 font-semibold shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              新規登録（冒険者になる）
            </Button>
          </Link>

          {/* フッター */}
          <div className="pt-4 border-t border-white/10 text-center text-xs text-muted-foreground space-y-2">
            <p>✨ レベルアップ・バッジ獲得で成長を実感 ✨</p>
            <p className="text-pink-400/70">
              ログイン後、あなた専用のRPGマイページへ
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
