"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileForm } from "@/components/ProfileForm";
import { ManageSports } from "@/components/ManageSports";
import { PerformanceTracker } from "@/components/PerformanceTracker";
import { Loader2, User, Trophy, Calendar, MapPin, ShieldCheck, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PageHeaderBackground } from "@/components/PageHeaderBackground";

export default function MyProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [sportsList, setSportsList] = useState<any[]>([]); // For the dropdown in ManageSports

  const fetchProfile = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        router.replace("/login");
        return;
      }

      // Fetch user profile and their sports
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          *,
          athlete_sports (
            id,
            sport_id,
            skill_level,
            sports (id, name)
          )
        `)
        .eq("id", userData.user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch all sports for the dropdown
      const { data: allSports } = await supabase.from("sports").select("*").order("name");

      setProfile(profileData);
      setSportsList(allSports || []);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const userSports = profile.athlete_sports || [];

  return (
    <div className="relative min-h-screen">
      <PageHeaderBackground />
      <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-500 relative z-10">
        <div className="mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 bg-card/50 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/4" />
          
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profile_photo_url} />
              <AvatarFallback className="text-4xl bg-primary/20 text-primary">{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            {profile.reliability_score >= 90 && (
              <div className="absolute bottom-0 right-0 bg-background rounded-full p-1.5 shadow-xl border border-white/10">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-extrabold">{profile.full_name}</h1>
              {profile.is_coach && (
                <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">Coach</Badge>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-muted-foreground mb-4">
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
            <p className="text-muted-foreground line-clamp-2 max-w-2xl">{profile.bio || "No bio added yet."}</p>
          </div>
        </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 mb-8 bg-background/50 border border-white/10 p-1">
          <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg">Performance</TabsTrigger>
          <TabsTrigger value="edit" className="rounded-lg">Edit Profile</TabsTrigger>
          <TabsTrigger value="sports" className="rounded-lg">Manage Sports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> My Sports
              </h3>
              {userSports.length > 0 ? (
                <div className="space-y-3">
                  {userSports.map((as: any) => (
                    <div key={as.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-white/5">
                      <span className="font-medium">{as.sports?.name}</span>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{as.skill_level}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">You haven't added any sports yet.</p>
              )}
            </div>

            <div className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" /> Availability
              </h3>
              {profile.availability_start && profile.availability_end ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-white/5">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-medium">{profile.availability_start}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl border border-white/5">
                    <span className="text-muted-foreground">To</span>
                    <span className="font-medium">{profile.availability_end}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">Availability not set.</p>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="edit">
          <div className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <ProfileForm profile={profile} onSuccess={fetchProfile} />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" /> Performance Tracker
            </h2>
            <PerformanceTracker userId={profile.id} userSports={userSports} />
          </div>
        </TabsContent>

        <TabsContent value="sports">
          <div className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">Manage Sports</h2>
            <ManageSports 
              userSports={userSports} 
              allSports={sportsList} 
              userId={profile.id} 
              onSuccess={fetchProfile} 
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}
