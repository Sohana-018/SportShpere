import { supabase } from "@/app/lib/supabase";
import { PageHeaderBackground } from "@/components/PageHeaderBackground";
import FeedClient from "./FeedClient";

export const revalidate = 0;

export default async function FeedPage() {
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        profile_photo_url,
        is_coach
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-screen">
      <PageHeaderBackground />
      <div className="container mx-auto px-4 py-8 max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Community Feed</h1>
          <p className="text-muted-foreground text-lg">See what athletes in your network are up to.</p>
        </div>
        
        <FeedClient initialPosts={posts || []} />
      </div>
    </div>
  );
}
