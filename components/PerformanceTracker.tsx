"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, Calendar, Trash2, Trophy } from "lucide-react";
import { format } from "date-fns";
import { EmptyState } from "./EmptyState";

interface PerformanceTrackerProps {
  userId: string;
  userSports: any[];
}

export function PerformanceTracker({ userId, userSports }: PerformanceTrackerProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  
  // Form state
  const [sportId, setSportId] = useState("");
  const [metricName, setMetricName] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [unit, setUnit] = useState("");

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_records')
        .select('*, sports(name)')
        .eq('athlete_id', userId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error("Error fetching performance records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportId || !metricName || !metricValue) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("performance_records").insert([
        {
          athlete_id: userId,
          sport_id: sportId,
          metric_name: metricName,
          metric_value: metricValue,
          unit: unit || null,
          source: 'self_reported'
        }
      ]);

      if (error) throw error;
      
      // Reset form
      setMetricName("");
      setMetricValue("");
      setUnit("");
      
      // Refresh list
      await fetchRecords();
    } catch (err) {
      console.error("Failed to log performance:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from("performance_records")
        .delete()
        .eq('id', recordId)
        .eq('athlete_id', userId); // Extra safety

      if (error) throw error;
      
      setRecords(records.filter(r => r.id !== recordId));
    } catch (err) {
      console.error("Failed to delete record:", err);
    }
  };

  if (loading) {
    return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
  }

  return (
    <div className="space-y-8">
      {/* Log Form */}
      <div className="bg-muted/20 p-6 rounded-xl border border-white/5">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Log New Performance
        </h3>
        
        {userSports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You need to add a sport in the "Manage Sports" tab before you can log performance metrics.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sport</Label>
                <Select value={sportId} onValueChange={setSportId} required>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Select sport">
                      {sportId ? (
                        (() => {
                          const sport = userSports.find(s => s.sport_id === sportId);
                          return Array.isArray(sport?.sports) ? sport?.sports[0]?.name : sport?.sports?.name || "Select sport";
                        })()
                      ) : (
                        "Select sport"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {userSports.map((as) => (
                      <SelectItem key={as.id} value={as.sport_id}>
                        {Array.isArray(as.sports) ? as.sports[0]?.name : as.sports?.name || "Unknown Sport"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Metric Name</Label>
                <Input 
                  placeholder="e.g. 5K Time, Batting Average" 
                  value={metricName}
                  onChange={(e) => setMetricName(e.target.value)}
                  required
                  className="bg-background/50 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label>Value</Label>
                <Input 
                  placeholder="e.g. 25:30, 0.350" 
                  value={metricValue}
                  onChange={(e) => setMetricValue(e.target.value)}
                  required
                  className="bg-background/50 border-white/10"
                />
              </div>

              <div className="space-y-2">
                <Label>Unit (Optional)</Label>
                <Input 
                  placeholder="e.g. mins, avg, kg" 
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="bg-background/50 border-white/10"
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full md:w-auto">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Log Performance
            </Button>
          </form>
        )}
      </div>

      {/* History List */}
      <div>
        <h3 className="text-lg font-bold mb-4">Performance History</h3>
        
        {records.length === 0 ? (
          <EmptyState icon={Trophy} title="No Records Yet" description="Log your first performance metric above to start tracking your progress." />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/10 hover:bg-muted/30 transition-colors rounded-xl border border-white/5 group">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-primary">
                      {record.metric_value} {record.unit}
                    </span>
                    <span className="text-sm font-medium">({record.metric_name})</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="bg-muted/50 px-2 py-0.5 rounded-md">
                      {record.sports?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.recorded_at ? format(new Date(record.recorded_at), "MMM d, yyyy") : ""}
                    </span>
                  </div>
                </div>
                
                {record.source === 'self_reported' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto mt-2 sm:mt-0 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDelete(record.id)}
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
