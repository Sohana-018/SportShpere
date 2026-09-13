"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          router.replace("/login");
          return;
        }
        setUserId(userData.user.id);

        // 1. Get events I have joined
        const { data: myEvents } = await supabase
          .from("event_participants")
          .select("event_id")
          .eq("user_id", userData.user.id)
          .eq("status", "joined");

        if (!myEvents || myEvents.length === 0) {
          setLoading(false);
          return;
        }

        const eventIds = myEvents.map((e) => e.event_id);

        // 2. Get other users in those events
        const { data: otherParticipants } = await supabase
          .from("event_participants")
          .select("user_id, profiles(id, full_name, profile_photo_url)")
          .in("event_id", eventIds)
          .eq("status", "joined")
          .neq("user_id", userData.user.id);

        if (!otherParticipants) {
          setLoading(false);
          return;
        }

        // Deduplicate users
        const uniqueUsersMap = new Map();
        otherParticipants.forEach((p: any) => {
          if (p.profiles && !uniqueUsersMap.has(p.profiles.id)) {
            uniqueUsersMap.set(p.profiles.id, p.profiles);
          }
        });

        setContacts(Array.from(uniqueUsersMap.values()));
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <MessageCircle className="w-8 h-8 text-primary" /> Messages
      </h1>

      <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Your Network</h2>
        <p className="text-muted-foreground mb-6">
          You can message athletes who are participating in the same games as you.
        </p>

        {contacts.length > 0 ? (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <Link 
                key={contact.id} 
                href={`/messages/${contact.id}`}
                className="flex items-center gap-4 p-4 bg-muted/20 hover:bg-muted/50 rounded-xl transition-colors border border-white/5"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={contact.profile_photo_url} />
                  <AvatarFallback>{contact.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{contact.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Click to view chat</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-white/5 border-dashed">
            <p className="text-muted-foreground">You haven't joined any games with other athletes yet.</p>
            <Link href="/discover" className="text-primary hover:underline mt-2 inline-block">
              Discover games to join
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
