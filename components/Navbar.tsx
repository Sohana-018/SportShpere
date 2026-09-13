"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Trophy, User, LogOut, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "./NotificationBell";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        fetchUnreadCount(user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUnreadCount(session.user.id);
      } else {
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUnreadCount = async (userId: string) => {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .is('read_at', null);
    
    if (count !== null) setUnreadCount(count);
  };

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to new messages for the badge
    const channel = supabase
      .channel('navbar_unread')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        () => {
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.read_at && !payload.old.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="border-b border-white/10 bg-background/60 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-background/40">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">
        <Link href="/" className="font-bold text-2xl tracking-tight text-primary flex items-center gap-2">
          <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <Trophy className="w-5 h-5" />
          </span>
          SportSphere
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/discover" className={buttonVariants({ variant: "ghost", className: "hidden sm:flex gap-2" })}>
            Discover
          </Link>
          <Link href="/feed" className={buttonVariants({ variant: "ghost", className: "hidden sm:flex gap-2" })}>
            Feed
          </Link>
          <Link href="/leaderboards" className={buttonVariants({ variant: "ghost", className: "hidden lg:flex gap-2" })}>
            Leaderboards
          </Link>
          {user ? (
            <>
              <NotificationBell />
              <Link href="/messages" className={buttonVariants({ variant: "ghost", className: "gap-2 relative" })}>
                <MessageCircle className="w-4 h-4" /> 
                Messages
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </Link>
              <Link href="/my-games" className={buttonVariants({ variant: "ghost", className: "hidden lg:flex gap-2" })}>
                <Trophy className="w-4 h-4" /> My Games
              </Link>
              <Link href="/profile" className={buttonVariants({ variant: "ghost", className: "gap-2" })}>
                <User className="w-4 h-4" /> My Profile
              </Link>
              <Button variant="ghost" onClick={handleLogout} title="Log out" size="icon">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost" })}>Log in</Link>
              <Link href="/login?mode=signup" className={buttonVariants({ className: "rounded-full shadow-md shadow-primary/25 hover:shadow-primary/40 transition-shadow" })}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
