"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Users } from "lucide-react";

type TeamType = "fukugyou" | "taishoku" | "buppan";

const teams = [
  { id: "fukugyou" as TeamType, name: "副業チーム", color: "#ec4899", description: "Instagram/TikTok運用" },
  { id: "taishoku" as TeamType, name: "退職サポートチーム", color: "#06b6d4", description: "退職支援コンテンツ" },
  { id: "buppan" as TeamType, name: "スマホ物販チーム", color: "#eab308", description: "X運用・物販" },
];

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [realName, setRealName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<TeamType | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // バリデーション
    if (!realName.trim()) {
      setError("漢字フルネームを入力してください");
      return;
    }
    if (!displayName.trim()) {
      setError("ニックネームを入力してください");
      return;
    }
    if (!selectedTeam) {
      setError("所属チームを選択してください");
      return;
    }
    // 🔐 パスワード検証強化: 8文字以上、英数字必須
    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("パスワードは英字と数字の両方を含む必要があります");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, displayName, selectedTeam, realName);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("このメールアドレスは既に登録されています");
      } else if (err.code === "auth/invalid-email") {
        setError("無効なメールアドレスです");
      } else if (err.code === "auth/weak-password") {
        setError("パスワードが弱すぎます。より強力なパスワードを設定してください");
      } else {
        setError("登録に失敗しました。もう一度お試しください");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 py-8 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* ロゴ/タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">新規登録</h1>
          <p className="text-gray-400">CC-Insight メンバー登録</p>
        </div>

        {/* 登録フォーム */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 漢字フルネーム */}
            <div className="space-y-2">
              <Label htmlFor="realName" className="text-gray-300">
                漢字フルネーム（正式名）
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="realName"
                  type="text"
                  placeholder="山田 太郎"
                  value={realName}
                  onChange={(e) => setRealName(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">※管理者のみ閲覧可能</p>
            </div>

            {/* ニックネーム */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-300">
                ニックネーム（表示名）
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="やまたろ"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">※ランキング等で公開されます</p>
            </div>

            {/* メールアドレス */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                メールアドレス
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20"
                  required
                />
              </div>
            </div>

            {/* パスワード */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                パスワード
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="6文字以上"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20"
                  required
                />
              </div>
            </div>

            {/* パスワード確認 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                パスワード（確認）
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-pink-500 focus:ring-pink-500/20"
                  required
                />
              </div>
            </div>

            {/* チーム選択 */}
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Users className="w-5 h-5" />
                所属チーム
              </Label>
              <div className="grid gap-3">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeam(team.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedTeam === team.id
                        ? "border-opacity-100 bg-opacity-20"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    style={{
                      borderColor: selectedTeam === team.id ? team.color : undefined,
                      backgroundColor: selectedTeam === team.id ? `${team.color}20` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <div>
                        <div className="font-medium text-white">{team.name}</div>
                        <div className="text-sm text-gray-400">{team.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* 登録ボタン */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/25"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登録中...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  アカウントを作成
                </div>
              )}
            </Button>
          </form>

          {/* ログインリンク */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              既にアカウントをお持ちですか？{" "}
              <Link
                href="/login"
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                ログイン
              </Link>
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <p className="text-center text-gray-500 text-sm mt-6">
          登録後、メール認証と管理者承認が必要です
        </p>
      </div>
    </div>
  );
}
