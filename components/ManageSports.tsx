"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ManageSportsProps {
  userSports: any[];
  allSports: any[];
  userId: string;
  onSuccess: () => void;
}

export function ManageSports({ userSports, allSports, userId, onSuccess }: ManageSportsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [skillLevel, setSkillLevel] = useState<string>("Beginner");

  const handleAddSport = async () => {
    if (!selectedSport) {
      setError("Please select a sport.");
      return;
    }

    // Check if sport is already added
    if (userSports.some((us) => us.sports?.id === selectedSport)) {
      setError("You have already added this sport.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from("athlete_sports").insert([
        {
          athlete_id: userId,
          sport_id: selectedSport,
          skill_level: skillLevel, // MUST be 'Beginner', 'Intermediate', 'Pro'
        }
      ]);

      if (insertError) throw insertError;
      
      setSelectedSport("");
      setSkillLevel("Beginner");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add sport.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSport = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("athlete_sports")
        .delete()
        .eq("id", id);
      
      if (deleteError) throw deleteError;
      
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to remove sport.");
    }
  };

  return (
    <div className="space-y-8">
      {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
      
      <div>
        <h3 className="text-lg font-bold mb-4">Add a new sport</h3>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="space-y-2 flex-1 w-full">
            <Label>Sport</Label>
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Select a sport" />
              </SelectTrigger>
              <SelectContent>
                {allSports.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex-1 w-full">
            <Label>Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleAddSport} disabled={loading || !selectedSport} className="w-full md:w-auto shadow-lg shadow-primary/25">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Add Sport
          </Button>
        </div>
      </div>

      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-bold mb-4">Your Sports</h3>
        {userSports.length > 0 ? (
          <div className="space-y-3">
            {userSports.map((as: any) => (
              <div key={as.id} className="flex items-center justify-between p-4 bg-background/30 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <div className="font-medium">{as.sports?.name}</div>
                  <Badge variant="outline" className="mt-1 bg-primary/10 text-primary border-primary/20">{as.skill_level}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveSport(as.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors" title="Remove sport">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-white/5 border-dashed">
            <p className="text-muted-foreground">You haven't added any sports yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
