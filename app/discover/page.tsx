import { supabase } from "@/app/lib/supabase";
import DiscoverClient from "./DiscoverClient";
import { PageHeaderBackground } from "@/components/PageHeaderBackground";

export const revalidate = 0; // Dynamic route

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams.q as string) || "";
  const sportId = (resolvedParams.sport as string) || "";
  const city = (resolvedParams.city as string) || "";
  const reliability = (resolvedParams.reliability as string) || "";
  const time = (resolvedParams.time as string) || "";
  const coach = (resolvedParams.coach as string) || "";

  // 1. Fetch Sports for filter dropdown
  const { data: sports } = await supabase.from("sports").select("*").order("name");

  // 2. Fetch Events based on filters
  let eventsQuery = supabase
    .from("events")
    .select(`
      *,
      sports:sport_id (name),
      profiles:created_by (full_name, reliability_score)
    `)
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (query) {
    eventsQuery = eventsQuery.ilike("title", `%${query}%`);
  }
  if (sportId) {
    eventsQuery = eventsQuery.eq("sport_id", sportId);
  }
  if (city) {
    eventsQuery = eventsQuery.ilike("city", `%${city}%`);
  }
  
  const { data: events } = await eventsQuery;

  // 3. Fetch Athletes based on filters
  let athletesQuery = supabase
    .from("profiles")
    .select(`
      *,
      athlete_sports (
        sports (id, name),
        skill_level
      )
    `)
    .order("reliability_score", { ascending: false });

  if (query) {
    athletesQuery = athletesQuery.ilike("full_name", `%${query}%`);
  }
  if (city) {
    athletesQuery = athletesQuery.ilike("city", `%${city}%`);
  }
  if (reliability && reliability !== "all") {
    athletesQuery = athletesQuery.gte("reliability_score", parseInt(reliability));
  }
  if (time) {
    // If they specified a time (e.g. "18:00"), we check if it falls within availability_start and availability_end
    // Format is time without time zone, so "18:00:00"
    athletesQuery = athletesQuery
      .lte("availability_start", `${time}:00`)
      .gte("availability_end", `${time}:00`);
  }
  if (coach === "true") {
    athletesQuery = athletesQuery.eq("is_coach", true);
  }
  
  const { data: rawAthletes } = await athletesQuery;
  
  // Filter athletes by sport in memory (since querying nested JSON/relations can be complex in basic Supabase syntax)
  let athletes = rawAthletes || [];
  if (sportId) {
    athletes = athletes.filter((a: any) => 
      a.athlete_sports?.some((as: any) => as.sports?.id === sportId)
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageHeaderBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <DiscoverClient 
          initialEvents={events || []} 
          initialAthletes={athletes} 
          sports={sports || []} 
          searchParams={{ query, sportId, city, coach }}
        />
      </div>
    </div>
  );
}
