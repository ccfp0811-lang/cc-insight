"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { 
  LayoutDashboard, 
  Briefcase, 
  LogOut, 
  Smartphone, 
  Trophy,
  User,
  Users,
  Settings,
  Shield
} from "lucide-react";
import { getUserGuardianProfile } from "@/lib/firestore";
import { GUARDIANS, ATTRIBUTES, EVOLUTION_STAGES, getGuardianImagePath, GuardianId } from "@/lib/guardian-collection";

// メンバー専用ナビゲーション（デスクトップ表示用）
const memberNavItems = [
  {
    title: "マイページ",
    subtitle: "あなたの冒険",
    href: "/mypage",
    icon: User,
  },
  {
    title: "ランキング",
    subtitle: "全メンバー比較",
    href: "/ranking",
    icon: Trophy,
  },
];

// モバイルドロワー用（サブ機能のみ）
const memberMobileNavItems = [
  {
    title: "設定",
    subtitle: "プロフィール編集",
    href: "/mypage",
    icon: Settings,
  },
];

// 管理者専用ナビゲーション
const adminNavItems = [
  {
    title: "Active Monitor",
    subtitle: "離脱防止監視",
    href: "/admin/monitor",
    icon: Shield,
  },
  {
    title: "副業チーム",
    subtitle: "IG / TT / YT",
    href: "/dashboard/side-job",
    icon: Briefcase,
  },
  {
    title: "退職サポートチーム",
    subtitle: "IG / TT / YT",
    href: "/dashboard/resignation",
    icon: LogOut,
  },
  {
    title: "スマホ物販チーム",
    subtitle: "X",
    href: "/dashboard/smartphone",
    icon: Smartphone,
  },
  {
    title: "ランキング",
    href: "/ranking",
    icon: Trophy,
  },
  {
    title: "ユーザー管理",
    subtitle: "承認・検索",
    href: "/admin/users",
    icon: Users,
  },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const [guardianInfo, setGuardianInfo] = useState<any>(null);

  // 役割に応じてナビゲーションを切り替え
  const navItems = userProfile?.role === "admin" ? adminNavItems : memberNavItems;
  const roleLabel = userProfile?.role === "admin" ? "管理者" : "メンバー";

  // ガーディアン情報取得（メンバーのみ - 新システム）
  useEffect(() => {
    if (!user || !userProfile || userProfile.role === "admin") return;

    const loadGuardianInfo = async () => {
      try {
        const profile = await getUserGuardianProfile(user.uid);
        if (!profile || !profile.activeGuardianId) return;

        const guardianId = profile.activeGuardianId as GuardianId;
        const guardian = GUARDIANS[guardianId];
        const instance = profile.guardians[guardianId];
        
        if (!guardian || !instance) return;

        const attr = ATTRIBUTES[guardian.attribute];
        const stage = instance.stage;
        const stageInfo = EVOLUTION_STAGES[stage];

        setGuardianInfo({
          guardianId,
          name: guardian.name,
          stage,
          stageName: stageInfo.name,
          color: attr.color,
          emoji: attr.emoji,
          energy: profile.energy.current,
        });
      } catch (error) {
        console.error("守護神情報取得エラー:", error);
      }
    };

    loadGuardianInfo();
  }, [user, userProfile]);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
            CC Insight
          </h1>
        </div>

        {/* User Info */}
        {userProfile && (
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: userProfile.role === "admin" ? "#a855f7" : "#ec4899",
                  boxShadow: userProfile.role === "admin" 
                    ? "0 0 15px rgba(168, 85, 247, 0.5)"
                    : "0 0 15px rgba(236, 72, 153, 0.5)",
                }}
              >
                {userProfile.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userProfile.displayName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Guardian Mini Display (Members Only) */}
        {userProfile && userProfile.role !== "admin" && guardianInfo && (
          <Link href="/mypage" onClick={onNavigate} className="block border-b border-white/10 p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl relative flex-shrink-0"
                style={{
                  backgroundColor: `${guardianInfo.color}20`,
                  boxShadow: `0 0 15px ${guardianInfo.color}60`,
                  border: `2px solid ${guardianInfo.color}`,
                }}
              >
                {guardianInfo.emoji}
                {guardianInfo.stage === 4 && (
                  <span className="absolute -top-1 -right-1 text-sm">👑</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Stage {guardianInfo.stage}</p>
                <p className="text-xs font-bold truncate" style={{ color: guardianInfo.color }}>
                  {guardianInfo.stageName}
                </p>
              </div>
            </div>
            
            {/* エナジー表示 */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">保有エナジー</span>
              <span className="font-bold text-yellow-400">{guardianInfo.energy}E</span>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-foreground border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-colors flex-shrink-0",
                  isActive ? "text-pink-500" : ""
                )} />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{item.title}</span>
                  {item.subtitle && (
                    <span className="text-xs text-muted-foreground truncate block">{item.subtitle}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <p className="text-xs text-muted-foreground text-center">
            © 2024 CC Insight
          </p>
        </div>
      </div>
    </aside>
  );
}
