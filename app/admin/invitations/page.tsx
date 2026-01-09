
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth, AdminGuard } from "@/lib/auth-context";
import { getAllInvitations, createInvitation, Invitation } from "@/lib/invitations";
import { GlassCard } from "@/components/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Ticket,
    Plus,
    RefreshCw,
    Copy,
    Check,
    Calendar,
    User,
    Loader2,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";


export default function AdminInvitationsPage() {
    const { user } = useAuth();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [memo, setMemo] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const loadInvitations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllInvitations();
            setInvitations(data);
        } catch (error) {
            console.error("Error fetching invitations:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvitations();
    }, [loadInvitations]);

    const handleGenerate = async () => {
        if (!user) return;

        try {
            setGenerating(true);
            await createInvitation(user.uid, memo);
            setMemo("");
            await loadInvitations();
        } catch (error) {
            console.error("Error creating invitation:", error);
            alert("招待コードの作成に失敗しました");
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const unusedCount = invitations.filter(i => !i.isUsed).length;
    const usedCount = invitations.filter(i => i.isUsed).length;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
                <p className="text-sm text-muted-foreground">招待コードを読み込み中...</p>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="space-y-8 pb-[calc(var(--bottom-nav-height)+1rem)] md:pb-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                        招待コード管理
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        新規メンバー登録用の招待コードを発行・管理
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <GlassCard glowColor="#ec4899" title="総発行数" icon={<Ticket className="h-5 w-5" />} value={invitations.length.toString()} subtitle="全期間">
                        <div></div>
                    </GlassCard>
                    <GlassCard glowColor="#22c55e" title="未使用" icon={<Check className="h-5 w-5" />} value={unusedCount.toString()} subtitle="利用可能">
                        <div></div>
                    </GlassCard>
                    <GlassCard glowColor="#6b7280" title="使用済み" icon={<User className="h-5 w-5" />} value={usedCount.toString()} subtitle="登録完了">
                        <div></div>
                    </GlassCard>
                </div>

                {/* Generator */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            新規発行
                        </CardTitle>
                        <CardDescription>
                            新しい招待コードを発行します。メモ欄は管理用です。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-sm text-muted-foreground">メモ (任意)</label>
                                <Input
                                    placeholder="例: 1月度 副業チーム募集"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <Button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white min-w-[120px]"
                            >
                                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : "発行する"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* List */}
                <Card className="bg-white/5 backdrop-blur-xl border-white/10">
                    <CardHeader>
                        <CardTitle>コード一覧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invitations.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>招待コードはまだありません</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {invitations.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className={cn(
                                            "p-4 rounded-xl border transition-all flex items-center justify-between gap-4",
                                            inv.isUsed
                                                ? "bg-white/5 border-white/5 opacity-60"
                                                : "bg-white/10 border-white/20 hover:bg-white/15"
                                        )}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <code className="text-lg font-mono font-bold tracking-wider text-pink-400">
                                                    {inv.code}
                                                </code>
                                                {inv.isUsed ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                                                        使用済み
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                                                        未使用
                                                    </span>
                                                )}
                                                {inv.memo && (
                                                    <span className="text-sm text-muted-foreground">
                                                        {inv.memo}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    発行: {inv.createdAt?.toDate?.()?.toLocaleDateString("ja-JP") || "不明"}
                                                </span>
                                                {inv.isUsed && (
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        使用: {inv.usedAt?.toDate?.()?.toLocaleDateString("ja-JP") || "不明"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(inv.code)}
                                            className="text-muted-foreground hover:text-white"
                                        >
                                            {copiedId === inv.code ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminGuard>
    );
}
