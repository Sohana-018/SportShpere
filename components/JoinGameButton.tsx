"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinGameButtonProps {
  eventId: string;
  participants: any[];
}

export function JoinGameButton({ eventId, participants }: JoinGameButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setMyId(data.user.id);
        const joined = participants.some((p) => p.user_id === data.user.id && p.status === 'joined');
        setHasJoined(joined);
      }
    });
  }, [participants]);

  const handleJoin = async () => {
    if (!myId) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("event_participants").insert([
        {
          event_id: eventId,
          user_id: myId,
          status: "joined"
        }
      ]);

      if (error) {
        // If they already joined (constraint error), it's fine
        console.error(error);
      } else {
        setHasJoined(true);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (hasJoined) {
    return (
      <Button size="lg" className="w-full mb-6 text-lg h-14 bg-emerald-600 hover:bg-emerald-700 shadow-lg" disabled>
        <Check className="mr-2 w-5 h-5" /> Joined
      </Button>
    );
  }

  return (
    <Button 
      size="lg" 
      className="w-full mb-6 text-lg h-14 shadow-lg shadow-primary/25"
      onClick={handleJoin}
      disabled={loading}
    >
      {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Join Game"}
    </Button>
  );
}
