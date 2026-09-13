import { supabase } from "@/app/lib/supabase";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Users, Trophy, ChevronLeft, ShieldCheck, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { JoinGameButton } from "@/components/JoinGameButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import Link from "next/link";

export const revalidate = 0;

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: event, error } = await supabase
    .from("events")
    .select(`
      *,
      sports:sport_id (name),
      profiles:created_by (id, full_name, profile_photo_url, reliability_score),
      event_participants (
        user_id,
        status,
        profiles (id, full_name, profile_photo_url)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !event) {
    notFound();
  }

  const participants = event.event_participants || [];
  const joinedCount = participants.filter((p: any) => p.status === 'joined').length;

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <Link href="/discover" className={buttonVariants({ variant: "ghost", className: "mb-6" })}>
        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Discover
      </Link>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-48 bg-gradient-to-br from-primary/40 via-primary/20 to-background relative">
              <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
              <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur">
                {event.sports?.name || "Sport"}
              </Badge>
              <div className="absolute bottom-4 left-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground drop-shadow-md">
                  {event.title}
                </h1>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{event.event_date ? format(new Date(event.event_date), "EEEE, MMMM d • h:mm a") : "TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">{event.location} {event.area ? `• ${event.area}` : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">
                    {joinedCount} {event.max_participants ? `/ ${event.max_participants}` : ""} Players
                  </span>
                </div>
              </div>

              {event.description && (
                <div>
                  <h3 className="text-lg font-bold mb-2">About this game</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Skill Level:</span>
                <Badge variant="outline" className="capitalize">{event.skill_level || "Any"}</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <JoinGameButton eventId={event.id} participants={participants} />

            <h3 className="text-lg font-bold mb-4">Organizer</h3>
            <Link href={`/profiles/${event.profiles?.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <Avatar className="w-12 h-12">
                <AvatarImage src={event.profiles?.profile_photo_url} />
                <AvatarFallback>{event.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{event.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Reliability: {Number(event.profiles?.reliability_score).toFixed(0)}%
                  {event.profiles?.reliability_score >= 90 && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
                </p>
              </div>
            </Link>
          </div>

          <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Players ({joinedCount})</h3>
            </div>
            <div className="space-y-3">
              {participants.filter((p: any) => p.status === 'joined').map((p: any) => (
                <div key={p.user_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                  <Link href={`/profiles/${p.user_id}`} className="flex items-center gap-3 flex-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={p.profiles?.profile_photo_url} />
                      <AvatarFallback>{p.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{p.profiles?.full_name}</span>
                  </Link>
                  <Link href={`/messages/${p.user_id}`} className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100">
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              {joinedCount === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No players joined yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
