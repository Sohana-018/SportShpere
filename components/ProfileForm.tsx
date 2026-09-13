"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Or we use Input if Textarea is not installed. Let's use standard HTML textarea with styling if needed, but shadcn textarea might not be added.
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: any;
  onSuccess: () => void;
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    city: profile.city || "",
    area: profile.area || "",
    bio: profile.bio || "",
    availability_start: profile.availability_start || "",
    availability_end: profile.availability_end || "",
    profile_photo_url: profile.profile_photo_url || "",
    is_coach: profile.is_coach || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        full_name: formData.full_name,
        city: formData.city,
        area: formData.area,
        bio: formData.bio,
        availability_start: formData.availability_start || null,
        availability_end: formData.availability_end || null,
        profile_photo_url: formData.profile_photo_url,
        is_coach: formData.is_coach,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(payload)
        .eq("id", profile.id);

      if (updateError) throw updateError;
      
      setSuccessMsg("Profile updated successfully!");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
      {successMsg && <div className="text-emerald-500 text-sm bg-emerald-500/10 p-3 rounded-md">{successMsg}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" value={formData.full_name} onChange={handleChange} required className="bg-background/50 border-white/10" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city} onChange={handleChange} className="bg-background/50 border-white/10" placeholder="e.g. New York" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Area / Neighborhood</Label>
          <Input id="area" value={formData.area} onChange={handleChange} className="bg-background/50 border-white/10" placeholder="e.g. Brooklyn" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability_start">Availability Start Time</Label>
          <Input id="availability_start" type="time" value={formData.availability_start} onChange={handleChange} className="bg-background/50 border-white/10" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability_end">Availability End Time</Label>
          <Input id="availability_end" type="time" value={formData.availability_end} onChange={handleChange} className="bg-background/50 border-white/10" />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="profile_photo_url">Profile Photo URL</Label>
          <Input id="profile_photo_url" value={formData.profile_photo_url} onChange={handleChange} className="bg-background/50 border-white/10" placeholder="https://..." />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea 
            id="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            className="flex min-h-[80px] w-full rounded-md border border-white/10 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Tell others a bit about yourself..."
          />
        </div>

        <div className="space-y-2 md:col-span-2 flex items-center gap-2">
          <input 
            type="checkbox" 
            id="is_coach" 
            checked={formData.is_coach}
            onChange={(e) => setFormData({ ...formData, is_coach: e.target.checked })}
            className="w-4 h-4 rounded border-white/10 bg-background/50 accent-primary"
          />
          <Label htmlFor="is_coach" className="mb-0 cursor-pointer">I am a coach / mentor</Label>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full md:w-auto px-8 shadow-lg shadow-primary/25">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
