"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Shield } from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface DMMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message: string;
  createdAt: Timestamp;
  isAdmin: boolean;
}

export default function MemberDMPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (userProfile?.status !== "approved") {
      router.push("/pending-approval");
      return;
    }

    // リアルタイムでメッセージを監視
    const q = query(
      collection(db, "dm_messages"),
      where("participants", "array-contains", user.uid),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: DMMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({
          id: doc.id,
          ...doc.data(),
        } as DMMessage);
      });
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user, userProfile, router]);

  async function sendMessage() {
    if (!newMessage.trim() || !user || !userProfile) return;

    try {
      setSending(true);
      
      // 管理者のUIDを取得（簡易版：最初の管理者に送信）
      // 本番環境では特定の管理者を選択できるようにする
      const adminUserId = "ADMIN_UID"; // 実際には管理者UIDを動的に取得
      
      await addDoc(collection(db, "dm_messages"), {
        fromUserId: user.uid,
        fromUserName: userProfile.displayName,
        toUserId: adminUserId,
        toUserName: "運営",
        message: newMessage.trim(),
        isAdmin: false,
        participants: [user.uid, adminUserId],
        createdAt: serverTimestamp(),
      });
      setNewMessage("");
    } catch (error) {
      console.error("メッセージ送信エラー:", error);
      alert("メッセージの送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="space-y-6 pb-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-500" />
          運営とのDM
        </h1>
        <p className="text-muted-foreground mt-2">
          運営に直接メッセージを送れます
        </p>
      </div>

      {/* チャットエリア */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            運営とのチャット
          </CardTitle>
          <CardDescription>
            質問や相談などお気軽にお送りください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* メッセージエリア */}
            <div className="h-[500px] overflow-y-auto p-4 bg-muted/20 rounded-lg space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>まだメッセージがありません</p>
                  <p className="text-sm mt-2">運営にメッセージを送信してみましょう！</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.fromUserId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.fromUserId === user?.uid
                          ? 'bg-blue-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}
                    >
                      {msg.fromUserId !== user?.uid && (
                        <p className="text-xs mb-1 opacity-80">運営</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.fromUserId === user?.uid ? 'text-blue-100' : 'text-purple-100'
                      }`}>
                        {msg.createdAt?.toDate?.()?.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) || '送信中...'}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="メッセージを入力..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
