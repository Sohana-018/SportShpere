import { supabase } from "@/app/lib/supabase";
import { notFound } from "next/navigation";
import { MapPin, Trophy, ShieldCheck, Calendar, ChevronLeft, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export const revalidate = 0;

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      athlete_sports (
        skill_level,
        sports (id, name)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const sports = profile.athlete_sports || [];

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500 max-w-4xl">
      <Link href="/discover" className={buttonVariants({ variant: "ghost", className: "mb-6" })}>
        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Discover
      </Link>

      <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header Cover */}
        <div className="h-48 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-primary/10 to-background relative" />
        
        <div className="px-6 md:px-12 pb-10">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20 mb-8">
            <div className="relative inline-block">
              <Avatar className="w-40 h-40 border-8 border-background shadow-2xl">
                <AvatarImage src={profile.profile_photo_url} />
                <AvatarFallback className="text-5xl bg-primary/20 text-primary">{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              {profile.reliability_score >= 90 && (
                <div className="absolute bottom-2 right-2 bg-background rounded-full p-2 shadow-xl border border-white/10">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-extrabold mb-2">{profile.full_name}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {profile.city || "No city set"} {profile.area ? `• ${profile.area}` : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-primary" />
                  Reliability: {Number(profile.reliability_score).toFixed(0)}%
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  Joined {format(new Date(profile.created_at), "MMM yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Sports & Skills
                </h3>
                {sports.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sports.map((as: any, idx: number) => (
                      <div key={idx} className="bg-muted/30 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                        <span className="font-medium text-lg">{as.sports?.name}</span>
                        <Badge variant="secondary" className="capitalize px-3 py-1 bg-primary/20 text-primary hover:bg-primary/30">
                          {as.skill_level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No sports added yet.</p>
                )}
              </div>

              {profile.bio && (
                <div>
                  <h3 className="text-xl font-bold mb-3">About Me</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}
            </div>
            
            <div>
              <div className="bg-muted/30 border border-white/5 p-6 rounded-2xl">
                <h3 className="font-bold mb-4">Availability</h3>
                {profile.availability_start && profile.availability_end ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-muted-foreground">From</span>
                      <span className="font-medium">{profile.availability_start}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">To</span>
                      <span className="font-medium">{profile.availability_end}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Not specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
