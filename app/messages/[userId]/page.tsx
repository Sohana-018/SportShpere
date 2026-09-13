"use client";

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { Loader2, Send, ChevronLeft, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = React.use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myId, setMyId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserId = resolvedParams.userId;

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          router.replace("/login");
          return;
        }
        setMyId(userData.user.id);

        // Fetch other user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, profile_photo_url")
          .eq("id", otherUserId)
          .single();

        if (profileData) {
          setOtherUser(profileData);
        }

        // Fetch initial messages
        const { data: msgs, error: msgsError } = await supabase
          .from("messages")
          .select("*")
          .or(`and(sender_id.eq.${userData.user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userData.user.id})`)
          .order("created_at", { ascending: true });

        if (!msgsError && msgs) {
          setMessages(msgs);
        }
      } catch (error) {
        console.error("Error init chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitData();
  }, [router, otherUserId]);

  useEffect(() => {
    if (!myId || !otherUserId) return;

    const channelName = `chat_${[myId, otherUserId].sort().join('_')}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log("Realtime payload received:", payload);
          const msg = payload.new;
          if (
            (msg.sender_id === myId && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === myId)
          ) {
            console.log("Message matches current conversation, updating state!");
            setMessages((prev) => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            
            if (msg.receiver_id === myId) {
              supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', msg.id).then();
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log("Subscription status:", status, err);
      });

    // Mark existing unread messages as read
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', myId)
      .eq('sender_id', otherUserId)
      .is('read_at', null)
      .then();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId, otherUserId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !myId) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic clear

    try {
      const { error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: myId,
            receiver_id: otherUserId,
            message: content,
          }
        ]);
        
      if (error) {
        console.error("Failed to send message:", error);
        setNewMessage(content); // Restore on error
      }
    } catch (err) {
      console.error(err);
      setNewMessage(content);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/messages" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        {otherUser && (
          <Link href={`/profiles/${otherUser.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.profile_photo_url} />
              <AvatarFallback>{otherUser.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{otherUser.full_name}</h2>
          </Link>
        )}
      </div>

      <div className="flex-1 bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p>No messages yet. Say hi!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === myId;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMine 
                        ? "bg-primary text-primary-foreground rounded-tr-sm" 
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-[10px] mt-1 text-right opacity-70 ${isMine ? "text-primary-foreground" : "text-muted-foreground"}`}>
                      {msg.created_at ? format(new Date(msg.created_at), "h:mm a") : ""}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-background/50 border-t border-white/10">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background/50 border-white/10"
              autoFocus
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full shrink-0 shadow-lg shadow-primary/25">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
