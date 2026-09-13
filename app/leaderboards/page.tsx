import { supabase } from "@/app/lib/supabase";
import LeaderboardsClient from "./LeaderboardsClient";

import { PageHeaderBackground } from "@/components/PageHeaderBackground";

export const revalidate = 0; // Dynamic route

export default async function LeaderboardsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  // Fetch Sports for filter dropdown
  const { data: sports } = await supabase.from("sports").select("*").order("name");

  return (
    <div className="relative min-h-screen">
      <PageHeaderBackground />
      <div className="relative z-10">
        <LeaderboardsClient sports={sports || []} />
      </div>
    </div>
  );
}
