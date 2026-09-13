"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface EditGameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sports: any[];
  event: any;
}

export function EditGameModal({ open, onOpenChange, sports, event }: EditGameModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with existing event data
  const [formData, setFormData] = useState({
    title: event.title || "",
    description: event.description || "",
    sport_id: event.sport_id || "",
    location: event.location || "",
    city: event.city || "",
    area: event.area || "",
    // Format date for datetime-local input
    event_date: event.event_date ? format(new Date(event.event_date), "yyyy-MM-dd'T'HH:mm") : "",
    max_participants: event.max_participants?.toString() || "",
    skill_level: event.skill_level || "All Levels",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        sport_id: formData.sport_id,
        location: formData.location,
        city: formData.city,
        area: formData.area,
        event_date: new Date(formData.event_date).toISOString(),
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        skill_level: formData.skill_level === "All Levels" ? null : formData.skill_level,
      };

      const { error: updateError } = await supabase
        .from("events")
        .update(eventPayload)
        .eq("id", event.id);

      if (updateError) throw updateError;

      onOpenChange(false);
      router.refresh(); // Refresh page data
    } catch (err: any) {
      setError(err.message || "Failed to update game.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>
            Update the details for your pickup game.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Sunday Morning Hoops" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sport_id">Sport *</Label>
              <Select value={formData.sport_id} onValueChange={(val) => handleSelectChange("sport_id", val)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport">
                    {formData.sport_id ? sports.find(s => s.id === formData.sport_id)?.name : "Select a sport"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {sports.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event_date">Date & Time *</Label>
              <Input id="event_date" type="datetime-local" value={formData.event_date} onChange={handleChange} required />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Location / Venue *</Label>
              <Input id="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Central Park Courts" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={formData.city} onChange={handleChange} placeholder="e.g. New York" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area">Area / Neighborhood</Label>
              <Input id="area" value={formData.area} onChange={handleChange} placeholder="e.g. Manhattan" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max_participants">Max Players</Label>
              <Input id="max_participants" type="number" min="2" value={formData.max_participants} onChange={handleChange} placeholder="Leave empty for unlimited" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="skill_level">Expected Skill Level</Label>
              <Select value={formData.skill_level} onValueChange={(val) => handleSelectChange("skill_level", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Levels">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={formData.description} onChange={handleChange} placeholder="Any specific rules or things to bring?" className="h-20" />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.sport_id || !formData.event_date || !formData.location}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
