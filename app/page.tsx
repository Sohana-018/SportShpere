import { supabase } from "@/app/lib/supabase";
import { EventCard } from "@/components/EventCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Activity, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { AIMatchmaker } from "@/components/AIMatchmaker";

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const { data: events, error } = await supabase
    .from("events")
    .select(`
      *,
      sports:sport_id (name),
      profiles:created_by (full_name, reliability_score)
    `)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true })
    .limit(6);

  if (error) {
    console.error("Error fetching events:", error);
  }

  const { data: sports } = await supabase.from("sports").select("*").order("name");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-sm font-medium">Join the ultimate athlete network</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
                Find Your Game. <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                  Build Your Squad.
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                Connect with local athletes, join pickup games, and track your reliability. 
                SportSphere is where the action happens.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
                <Link href="/login?mode=signup" className={buttonVariants({ size: "lg", className: "rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1" })}>
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/discover" className={buttonVariants({ size: "lg", variant: "outline", className: "rounded-full px-8 h-14 text-lg w-full sm:w-auto backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all hover:-translate-y-1" })}>
                  Explore Games
                </Link>
              </div>
            </div>

            {/* Masonry Images */}
            <div className="hidden lg:block relative h-[500px] w-full animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <div className="absolute right-0 top-0 w-2/3 h-4/5 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 border border-border rotate-3 hover:rotate-0 transition-transform duration-500">
                <img src="/hero/basketball.jpg" alt="Basketball Game" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="absolute left-0 bottom-0 w-3/5 h-2/3 rounded-3xl overflow-hidden shadow-2xl border border-border -rotate-6 hover:-rotate-0 transition-transform duration-500 z-10">
                <img src="/hero/soccer.jpg" alt="Soccer Sunset" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Matchmaker Section */}
      <section className="py-8 container mx-auto px-4 relative z-20">
        <AIMatchmaker sports={sports || []} />
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30 border-y border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Discover Games</h3>
              <p className="text-muted-foreground">Find local pickup games matching your skill level and schedule instantly.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect Athletes</h3>
              <p className="text-muted-foreground">Build your network, form teams, and meet reliable players in your city.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-background/50 backdrop-blur-sm border border-border hover:border-primary/30 transition-colors">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Earn Reliability</h3>
              <p className="text-muted-foreground">Show up, play fair, and build your reputation with our reliability scoring system.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Feed Section */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Games Near You</h2>
            <p className="text-muted-foreground text-lg">Join the action. Here are some of the latest pickup games created by the community.</p>
          </div>
          <Link href="/login" className={buttonVariants({ variant: "ghost", className: "mt-4 md:mt-0 group" })}>
            View all games <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} publicView />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-muted/30 rounded-2xl border border-border border-dashed">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No upcoming games</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a game in your area!</p>
            <Link href="/login?mode=signup" className={buttonVariants()}>Sign up to create a game</Link>
          </div>
        )}
      </section>
    </div>
  );
}
