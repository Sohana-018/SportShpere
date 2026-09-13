"use client";

import { useState } from "react";
import { CreatePost } from "@/components/CreatePost";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";

interface FeedClientProps {
  initialPosts: any[];
}

export default function FeedClient({ initialPosts }: FeedClientProps) {
  const [posts, setPosts] = useState(initialPosts);

  const fetchPosts = async () => {
    const { data } = await supabase
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
    
    if (data) {
      setPosts(data);
    }
  };

  return (
    <div>
      <CreatePost onPostCreated={fetchPosts} />
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-card/50 backdrop-blur-md border border-white/10 rounded-2xl">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <Link href={`/profiles/${post.profiles?.id}`}>
                  <Avatar className="w-12 h-12 border border-white/10 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={post.profiles?.profile_photo_url} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {post.profiles?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <div className="flex items-center gap-2">
                    <Link href={`/profiles/${post.profiles?.id}`} className="font-bold hover:underline">
                      {post.profiles?.full_name}
                    </Link>
                    {post.profiles?.is_coach && (
                      <Badge variant="default" className="text-[10px] h-5 bg-primary/20 text-primary border-primary/30">
                        Coach
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
