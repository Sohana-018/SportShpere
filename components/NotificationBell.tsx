"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabase";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // Use a ref so cleanup is synchronous and doesn't race on StrictMode double-mount
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user || !isMounted) return;

      const uid = userData.user.id;

      // Fetch existing notifications
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data && isMounted) {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }

      // Build channel: .on() must come BEFORE .subscribe()
      // Use a timestamp suffix to guarantee a fresh channel name on each mount
      const channelName = `notif_bell_${uid}_${Date.now()}`;
      channelRef.current = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${uid}`,
          },
          (payload: any) => {
            if (!isMounted) return;
            setNotifications((prev) => [payload.new, ...prev]);
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();
    };

    init();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userData.user.id)
      .eq("is_read", false);

    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) markAllAsRead(); }}>
      {/*
        Base UI's MenuPrimitive.Trigger already renders a <button>.
        Do NOT use asChild + another <button> — that nests two <button> elements.
        Just put content directly inside DropdownMenuTrigger and style it via className.
      */}
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-card/95 backdrop-blur-md border-white/10">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-center text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex flex-col items-start p-3 focus:bg-white/5 cursor-default"
              >
                <span className="font-medium text-sm">{notif.type}</span>
                <span className="text-xs text-muted-foreground">{notif.message}</span>
                <span className="text-[10px] text-muted-foreground mt-1 opacity-70">
                  {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
