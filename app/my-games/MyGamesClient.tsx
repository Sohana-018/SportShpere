"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Loader2, Calendar, MapPin, Trophy, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, differenceInHours } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FeedbackSection } from "@/components/FeedbackSection";

import { useRouter } from "next/navigation";

type EventStatus = "Upcoming" | "In Progress" | "Completed";

interface JoinedEvent {
  event_id: string;
  status: string;
  events: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    area: string | null;
    sports: { name: string } | null;
  };
  computedStatus?: EventStatus;
}

export default function MyGamesClient() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<JoinedEvent[]>([]);
  const [feedbackPromptEvent, setFeedbackPromptEvent] = useState<any | null>(null);
  const [feedbackPromptParticipants, setFeedbackPromptParticipants] = useState<any[]>([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const fetchGames = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.replace("/login");
        return;
      }
      const currentUserId = userData.user.id;
      setUserId(currentUserId);

      // 1. Fetch user's joined events
      const { data: myParticipations, error } = await supabase
        .from("event_participants")
        .select(`
          event_id,
          status,
          events (
            id,
            title,
            event_date,
            location,
            area,
            sports:sport_id (name)
          )
        `)
        .eq("user_id", currentUserId)
        .eq("status", "joined");

      if (error) throw error;
      
      const joinedGames = myParticipations as JoinedEvent[];
      setGames(computeStatuses(joinedGames));

      // 2. Identify a completed game that needs feedback
      await checkFeedbackRequirements(joinedGames, currentUserId);
    } catch (err) {
      console.error("Error fetching games:", err);
    } finally {
      setLoading(false);
    }
  };

  const computeStatuses = (gamesList: JoinedEvent[]) => {
    const now = new Date();
    return gamesList.map(g => {
      const eventDate = new Date(g.events.event_date);
      let status: EventStatus = "Upcoming";
      
      const hoursDiff = differenceInHours(now, eventDate);
      
      if (now > eventDate) {
        if (hoursDiff >= 3) {
          status = "Completed";
        } else {
          status = "In Progress";
        }
      }
      
      return { ...g, computedStatus: status };
    }).sort((a, b) => new Date(b.events.event_date).getTime() - new Date(a.events.event_date).getTime());
  };

  const checkFeedbackRequirements = async (gamesList: JoinedEvent[], currentUserId: string) => {
    const computedGames = computeStatuses(gamesList);
    const completedGames = computedGames.filter(g => g.computedStatus === "Completed");
    
    // Get dismissed event IDs from localStorage
    const dismissedIdsStr = localStorage.getItem("dismissed_feedback_events");
    const dismissedIds = dismissedIdsStr ? JSON.parse(dismissedIdsStr) : [];

    for (const game of completedGames) {
      const eventId = game.event_id;
      if (dismissedIds.includes(eventId)) continue;

      // Fetch all joined participants for this event
      const { data: participants } = await supabase
        .from("event_participants")
        .select(`
          user_id,
          status,
          profiles (id, full_name, profile_photo_url)
        `)
        .eq("event_id", eventId)
        .eq("status", "joined");

      if (!participants || participants.length <= 1) continue; // Only me

      const otherParticipantsCount = participants.filter(p => p.user_id !== currentUserId).length;

      // Fetch feedback given by this user for this event
      const { data: givenFeedback } = await supabase
        .from("game_feedback")
        .select("reviewed_user_id")
        .eq("event_id", eventId)
        .eq("reviewer_id", currentUserId);

      const feedbackGivenCount = givenFeedback ? givenFeedback.length : 0;

      // If we haven't given feedback to ALL other participants
      if (feedbackGivenCount < otherParticipantsCount) {
        setFeedbackPromptEvent(game.events);
        setFeedbackPromptParticipants(participants);
        break; // Show prompt for the first one found
      }
    }
  };

  useEffect(() => {
    fetchGames();
    
    // Live update statuses every minute
    const interval = setInterval(() => {
      setGames(prev => computeStatuses(prev));
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDismissBanner = () => {
    if (!feedbackPromptEvent) return;
    
    const eventId = feedbackPromptEvent.id;
    const dismissedIdsStr = localStorage.getItem("dismissed_feedback_events");
    const dismissedIds = dismissedIdsStr ? JSON.parse(dismissedIdsStr) : [];
    
    if (!dismissedIds.includes(eventId)) {
      dismissedIds.push(eventId);
      localStorage.setItem("dismissed_feedback_events", JSON.stringify(dismissedIds));
    }
    
    setFeedbackPromptEvent(null);
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case "Upcoming": return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "In Progress": return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "Completed": return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Prompt Banner */}
      {feedbackPromptEvent && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-primary/5 animate-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <div className="flex items-start gap-4 z-10 w-full md:w-auto">
            <div className="bg-background p-2 rounded-full border border-white/10 shrink-0 hidden sm:block">
              <ShieldAlert className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                Rate your teammates! <span className="text-xl">🙌</span>
              </h3>
              <p className="text-muted-foreground text-sm">
                You recently played <strong>{feedbackPromptEvent.title}</strong>. 
                Leave feedback for your fellow players to boost their reliability scores!
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 z-10">
            <Button variant="ghost" size="sm" onClick={handleDismissBanner} className="flex-1 md:flex-none">
              Maybe Later
            </Button>
            <Button size="sm" onClick={() => setIsFeedbackModalOpen(true)} className="flex-1 md:flex-none shadow-md shadow-primary/25">
              Leave Feedback
            </Button>
          </div>
          
          <button onClick={handleDismissBanner} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 transition-colors z-20">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Games List */}
      {games.length === 0 ? (
        <div className="text-center py-8 bg-card/50 backdrop-blur-md border border-border rounded-2xl shadow-sm">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">No games yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You haven't joined any games yet. Head over to the Discover page to find games near you!
          </p>
          <Link href="/discover">
            <Button className="shadow-lg shadow-primary/25">Find Games</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {games.map(game => (
            <Link key={game.event_id} href={`/events/${game.event_id}`}>
              <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-all hover:-translate-y-1 group">
                <div className="flex justify-between items-start mb-4">
                  <Badge className="bg-background/80 backdrop-blur border-white/10 group-hover:border-primary/20 transition-colors">
                    {game.events.sports?.name || "Sport"}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(game.computedStatus!)}>
                    {game.computedStatus}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-bold mb-4 line-clamp-1 group-hover:text-primary transition-colors">
                  {game.events.title}
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span className="line-clamp-1">
                      {format(new Date(game.events.event_date), "EEEE, MMMM d, yyyy • h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="line-clamp-1">
                      {game.events.location} {game.events.area ? `• ${game.events.area}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave Feedback for {feedbackPromptEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {feedbackPromptEvent && (
              <FeedbackSection 
                eventId={feedbackPromptEvent.id} 
                eventDate={feedbackPromptEvent.event_date} 
                participants={feedbackPromptParticipants} 
              />
            )}
            
            <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
              <Button onClick={() => {
                setIsFeedbackModalOpen(false);
                // Optionally check if all are completed and auto-dismiss, 
                // but re-fetching on next visit or interval will clear it anyway.
                // We'll let the user manually close the modal.
              }}>
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
