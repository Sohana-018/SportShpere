"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EventCard } from "@/components/EventCard";
import { AthleteCard } from "@/components/AthleteCard";
import { CreateGameModal } from "@/components/CreateGameModal";
import { EmptyState } from "@/components/EmptyState";
import { Search, MapPin, FilterX, Trophy, Users } from "lucide-react";

interface DiscoverClientProps {
  initialEvents: any[];
  initialAthletes: any[];
  sports: any[];
  searchParams: {
    query: string;
    sportId: string;
    city: string;
    coach?: string;
    age?: string;
  };
}

export default function DiscoverClient({ initialEvents, initialAthletes, sports, searchParams }: DiscoverClientProps) {
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.query || "");
  const [sportId, setSportId] = useState(searchParams.sportId || "");
  const [city, setCity] = useState(searchParams.city || "");
  const [minReliability, setMinReliability] = useState((searchParams as any).reliability || "");
  const [availabilityTime, setAvailabilityTime] = useState((searchParams as any).time || "");
  const [coachesOnly, setCoachesOnly] = useState((searchParams as any).coach === "true");
  const [ageRange, setAgeRange] = useState((searchParams as any).age || "");
  
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (sportId && sportId !== "all") params.set("sport", sportId);
    if (city) params.set("city", city);
    if (minReliability && minReliability !== "all") params.set("reliability", minReliability);
    if (availabilityTime) params.set("time", availabilityTime);
    if (coachesOnly) params.set("coach", "true");
    if (ageRange && ageRange !== "all") params.set("age", ageRange);
    
    router.push(`/discover?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setSportId("");
    setCity("");
    setMinReliability("");
    setAvailabilityTime("");
    setCoachesOnly(false);
    setAgeRange("");
    router.push("/discover");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Discover</h1>
          <p className="text-muted-foreground text-lg">Find games, meet athletes, and expand your network.</p>
        </div>
        <Button size="lg" onClick={() => setIsCreateGameOpen(true)} className="shadow-lg shadow-primary/25">
          Create a Game
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name or title..." 
              className="pl-9 bg-background/50 border-white/10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Select value={sportId || undefined} onValueChange={(val) => setSportId(val === "all" ? "" : val)}>
            <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-white/10">
              <SelectValue placeholder="Any Sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Sport</SelectItem>
              {sports.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1 md:max-w-[250px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="City or Area..." 
              className="pl-9 bg-background/50 border-white/10"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 flex gap-4 w-full">
            <Select value={minReliability || undefined} onValueChange={(val) => setMinReliability(val === "all" ? "" : val)}>
              <SelectTrigger className="flex-1 bg-background/50 border-white/10">
                <SelectValue placeholder="Min. Reliability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Reliability</SelectItem>
                <SelectItem value="50">50% +</SelectItem>
                <SelectItem value="75">75% +</SelectItem>
                <SelectItem value="90">90% +</SelectItem>
                <SelectItem value="100">100%</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ageRange || undefined} onValueChange={(val) => setAgeRange(val === "all" ? "" : val)}>
              <SelectTrigger className="flex-1 bg-background/50 border-white/10">
                <SelectValue placeholder="Age Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Age</SelectItem>
                <SelectItem value="18-25">18-25</SelectItem>
                <SelectItem value="26-35">26-35</SelectItem>
                <SelectItem value="36-50">36-50</SelectItem>
                <SelectItem value="50+">50+</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              type="time" 
              className="flex-1 bg-background/50 border-white/10" 
              value={availabilityTime}
              onChange={(e) => setAvailabilityTime(e.target.value)}
              title="Availability Time"
            />
            <div className="flex items-center gap-2 px-2 whitespace-nowrap">
              <input
                type="checkbox"
                id="coachesOnly"
                checked={coachesOnly}
                onChange={(e) => setCoachesOnly(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-background/50 accent-primary"
              />
              <label htmlFor="coachesOnly" className="text-sm cursor-pointer">Coaches Only</label>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
            <Button onClick={handleSearch} className="flex-1 md:px-8">Search</Button>
            {(query || sportId || city || minReliability || availabilityTime || coachesOnly || (ageRange && ageRange !== "all")) && (
              <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear filters">
                <FilterX className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="games" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-background/50 p-1 border border-white/10">
          <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            Upcoming Games
          </TabsTrigger>
          <TabsTrigger value="athletes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg">
            Athletes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="games" className="mt-0">
          {initialEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Trophy} title="No Games Found" description="Try adjusting your filters or create a new game." />
          )}
        </TabsContent>
        
        <TabsContent value="athletes" className="mt-0">
          {initialAthletes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {initialAthletes.map(athlete => (
                <AthleteCard key={athlete.id} athlete={athlete} />
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="No Athletes Found" description="Try adjusting your filters." />
          )}
        </TabsContent>
      </Tabs>

      <CreateGameModal 
        open={isCreateGameOpen} 
        onOpenChange={setIsCreateGameOpen}
        sports={sports}
      />
    </div>
  );
}
