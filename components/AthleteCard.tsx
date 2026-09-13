import { User, MapPin, Trophy, ShieldCheck } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";

interface AthleteCardProps {
  athlete: any;
}

export function AthleteCard({ athlete }: AthleteCardProps) {
  // Extract profile from joined data (assuming joined from athlete_sports)
  const profile = athlete.profiles || athlete;
  const sports = athlete.sports ? [athlete.sports] : athlete.athlete_sports?.map((as: any) => as.sports) || [];
  
  const initials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "A";

  return (
    <Card className="overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-white/10 text-center flex flex-col h-full">
      <CardHeader className="pt-8 pb-4 flex flex-col items-center">
        <div className="relative mb-4">
          <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
            <AvatarImage src={profile.profile_photo_url} />
            <AvatarFallback className="text-3xl bg-primary/20 text-primary">{initials}</AvatarFallback>
          </Avatar>
          {profile.reliability_score >= 90 && (
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1 shadow-md">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
          )}
        </div>
        <h3 className="font-bold text-xl line-clamp-1">{profile.full_name}</h3>
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 mt-1">
          <MapPin className="w-3 h-3" />
          {profile.city || "No location set"}
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {sports.slice(0, 3).map((sport: any, idx: number) => (
            sport && sport.name ? (
              <Badge key={idx} variant="secondary" className="bg-secondary/50">
                {sport.name}
              </Badge>
            ) : null
          ))}
          {sports.length > 3 && (
            <Badge variant="outline" className="border-dashed">
              +{sports.length - 3}
            </Badge>
          )}
          {sports.length === 0 && (
            <span className="text-sm text-muted-foreground italic">No sports added</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-full text-sm">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="font-medium">Reliability: {Number(profile.reliability_score).toFixed(0)}%</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-6 pt-0 mt-auto">
        <Button className="w-full" variant="outline" asChild>
          <Link href={`/profiles/${profile.id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
