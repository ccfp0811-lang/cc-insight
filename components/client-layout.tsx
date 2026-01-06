"use client";

import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, AuthGuard } from "@/lib/auth-context";
import { Sidebar } from "@/components/sidebar";
import { LogOut, Home, ClipboardList, Trophy, LayoutDashboard, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 完全公開ページ（認証不要・サイドバー非表示・ボトムナビ非表示）
const publicPages = ["/login", "/register", "/verify-email", "/pending-approval", "/admin/login"];

function LogoutButton() {
  const { logout, user } = useAuth();

  if (!user) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={logout}
      className="hidden md:flex fixed top-4 right-4 z-50 text-muted-foreground hover:text-foreground"
    >
      <LogOut className="w-4 h-4 mr-2" />
      ログアウト
    </Button>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = publicPages.some((page) => pathname.startsWith(page));

  // 公開ページは認証なしで表示
  if (isPublicPage) {
    return <>{children}</>;
  }

  // 保護されたページ（認証必須）
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* デスクトップサイドバー */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-8 p-4 md:p-8 pt-[env(safe-area-inset-top,1rem)] w-full">
          <LogoutButton />
          {children}
        </main>

        {/* ボトムナビゲーション（モバイルのみ） */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}

function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout } = useAuth();

  // 管理者用のナビゲーション項目
  const adminNavItems = [
    {
      label: "全体状況",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "メンバー",
      icon: Users,
      href: "/admin/users",
    },
  ];

  // メンバー専用のナビゲーション項目
  const memberNavItems = [
    {
      label: "マイページ",
      icon: Home,
      href: "/mypage",
    },
    {
      label: "日報報告",
      icon: ClipboardList,
      href: "/report",
    },
    {
      label: "ランキング",
      icon: Trophy,
      href: "/ranking",
    },
  ];

  const handleLogout = () => {
    if (confirm("ログアウトしますか？")) {
      logout();
    }
  };

  // 管理者と一般メンバーで異なるナビを表示
  const navItems = userProfile?.role === "admin" ? adminNavItems : memberNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200 active:scale-95 relative z-50",
                isActive ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-fuchsia-500" : "text-slate-600"
              )}
              style={{ touchAction: "manipulation" }}
            >
              <Icon
                className={cn(
                  "w-6 h-6 transition-all",
                  isActive 
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-fuchsia-500 drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" 
                    : "text-slate-600"
                )}
                style={isActive ? {
                  filter: "drop-shadow(0 0 12px rgba(6,182,212,0.5)) drop-shadow(0 0 24px rgba(217,70,239,0.3))"
                } : undefined}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-fuchsia-500"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* ログアウトボタン */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200 active:scale-95 text-rose-600 hover:text-rose-700 relative z-50"
          style={{ touchAction: "manipulation" }}
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-medium">
            ログアウト
          </span>
        </button>
      </div>
    </nav>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
