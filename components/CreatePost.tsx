"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatePostProps {
  onPostCreated: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, profile_photo_url")
          .eq("id", userData.user.id)
          .single();
        if (data) setUserProfile(data);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("Not authenticated");

      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userData.user.id,
          content: content.trim(),
        });

      if (insertError) throw insertError;
      
      setContent("");
      onPostCreated();
    } catch (err: any) {
      setError(err.message || "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-sm mb-8">
      <form onSubmit={handleSubmit} className="flex gap-4">
        <Avatar className="w-10 h-10 border border-white/10 hidden sm:block">
          <AvatarImage src={userProfile?.profile_photo_url} />
          <AvatarFallback className="bg-primary/20 text-primary">
            {userProfile?.full_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, find a team, or post your latest win..."
            className="w-full bg-background/50 border border-white/10 rounded-xl p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            required
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !content.trim()} className="px-6 shadow-lg shadow-primary/25">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
