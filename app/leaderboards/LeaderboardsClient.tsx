"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Star, MapPin, Search, Loader2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";

export default function LeaderboardsClient({ sports }: { sports: any[] }) {
  const [activeTab, setActiveTab] = useState<"reliability" | "performance">("reliability");
  
  // Filters
  const [sportFilter, setSportFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [metricFilter, setMetricFilter] = useState("");
  
  // Data State
  const [loading, setLoading] = useState(false);
  const [reliabilityLeaders, setReliabilityLeaders] = useState<any[]>([]);
  const [performanceLeaders, setPerformanceLeaders] = useState<any[]>([]);
  const [availableMetrics, setAvailableMetrics] = useState<string[]>([]);

  // Fetch Reliability Leaders
  useEffect(() => {
    if (activeTab !== "reliability") return;
    let isMounted = true;

    const fetchReliability = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("profiles")
          .select(`*, athlete_sports(sport_id)`)
          .gt("reliability_score", 0)
          .order("reliability_score", { ascending: false });

        if (cityFilter) {
          query = query.ilike("city", `%${cityFilter}%`);
        }

        const { data, error } = await query;
        if (error) throw error;

        let filtered = data || [];
        if (sportFilter !== "all") {
          filtered = filtered.filter((profile) => 
            profile.athlete_sports?.some((as: any) => as.sport_id === sportFilter)
          );
        }

        if (isMounted) setReliabilityLeaders(filtered);
      } catch (err) {
        console.error("Error fetching reliability leaders:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReliability();
    return () => { isMounted = false; };
  }, [activeTab, cityFilter, sportFilter]);

  // Fetch distinct metrics when sport changes for Performance tab
  useEffect(() => {
    if (activeTab !== "performance" || sportFilter === "all") {
      setAvailableMetrics([]);
      setMetricFilter("");
      return;
    }

    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from("performance_records")
          .select("metric_name")
          .eq("sport_id", sportFilter);
        
        if (error) throw error;
        
        const distinctMetrics = Array.from(new Set(data?.map(d => d.metric_name) || []));
        if (isMounted) {
          setAvailableMetrics(distinctMetrics);
          if (distinctMetrics.length > 0 && !distinctMetrics.includes(metricFilter)) {
            setMetricFilter(distinctMetrics[0]);
          } else if (distinctMetrics.length === 0) {
            setMetricFilter("");
          }
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };

    fetchMetrics();
    return () => { isMounted = false; };
  }, [activeTab, sportFilter]);

  // Fetch Performance Leaders
  useEffect(() => {
    if (activeTab !== "performance" || sportFilter === "all" || !metricFilter) {
      setPerformanceLeaders([]);
      return;
    }
    
    let isMounted = true;
    const fetchPerformance = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("performance_records")
          .select(`*, profiles(id, full_name, profile_photo_url, city)`)
          .eq("sport_id", sportFilter)
          .eq("metric_name", metricFilter);

        if (error) throw error;
        
        // JS sorting
        const sorted = (data || []).sort((a, b) => {
          const valA = parseFloat(a.metric_value);
          const valB = parseFloat(b.metric_value);
          const isAValid = !isNaN(valA);
          const isBValid = !isNaN(valB);
          
          if (isAValid && isBValid) return valB - valA; // Descending
          if (isAValid && !isBValid) return -1;
          if (!isAValid && isBValid) return 1;
          return 0; // Both invalid
        });

        // Filter to highest score per user
        const bestPerUser = new Map();
        sorted.forEach((record) => {
          if (!record.profiles) return;
          const userId = record.profiles.id;
          if (!bestPerUser.has(userId)) {
            bestPerUser.set(userId, record);
          }
        });

        if (isMounted) setPerformanceLeaders(Array.from(bestPerUser.values()));
      } catch (err) {
        console.error("Error fetching performance leaders:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPerformance();
    return () => { isMounted = false; };
  }, [activeTab, sportFilter, metricFilter]);

  // Handle Tab Switch
  const handleTabSwitch = (tab: "reliability" | "performance") => {
    setActiveTab(tab);
    if (tab === "performance" && sportFilter === "all") {
       if (sports.length > 0) setSportFilter(sports[0].id);
    }
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-300";
    if (index === 2) return "text-amber-600";
    return "text-muted-foreground";
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Leaderboards</h1>
          <p className="text-muted-foreground text-lg">See who is topping the charts in SportSphere.</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-muted/20 p-1.5 rounded-xl border border-white/5 w-fit">
        <Button 
          variant={activeTab === "reliability" ? "default" : "ghost"} 
          onClick={() => handleTabSwitch("reliability")}
          className="gap-2"
        >
          <Star className="w-4 h-4" /> Reliability Score
        </Button>
        <Button 
          variant={activeTab === "performance" ? "default" : "ghost"} 
          onClick={() => handleTabSwitch("performance")}
          className="gap-2"
        >
          <Trophy className="w-4 h-4" /> Performance Metrics
        </Button>
      </div>

      <div className="bg-muted/20 p-6 rounded-xl border border-white/5 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="space-y-2 flex-1 md:max-w-xs">
            <label className="text-sm font-medium">Sport</label>
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Select sport">
                  {sportFilter === "all" ? "All Sports" : sports.find(s => s.id === sportFilter)?.name || "Select sport"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {activeTab === "reliability" && <SelectItem value="all">All Sports</SelectItem>}
                {sports.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {activeTab === "reliability" ? (
            <div className="space-y-2 flex-1 md:max-w-xs relative">
              <label className="text-sm font-medium">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Filter by city..." 
                  className="pl-9 bg-background/50 border-white/10"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 flex-1 md:max-w-xs">
              <label className="text-sm font-medium">Metric</label>
              <Select value={metricFilter} onValueChange={setMetricFilter} disabled={availableMetrics.length === 0}>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder={availableMetrics.length === 0 ? "No metrics found" : "Select metric"} />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-muted/10 border border-white/5 rounded-2xl overflow-hidden">
          {activeTab === "reliability" ? (
            reliabilityLeaders.length > 0 ? (
              <motion.div 
                initial="hidden" animate="show" 
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                className="divide-y divide-white/5"
              >
                {reliabilityLeaders.map((profile, i) => (
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    key={profile.id} 
                    className={`flex items-center p-4 md:p-6 hover:bg-muted/20 transition-colors ${i < 3 ? 'bg-primary/5 relative overflow-hidden' : ''}`}
                  >
                    {i < 3 && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 pointer-events-none" />}
                    <div className="w-8 md:w-12 text-center font-bold text-lg mr-4 relative z-10">
                      {i < 3 ? <Medal className={`w-8 h-8 mx-auto ${getMedalColor(i)}`} /> : <span className="text-muted-foreground">#{i + 1}</span>}
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary mr-4 shrink-0 overflow-hidden relative z-10 border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                      {profile.profile_photo_url ? (
                        <img src={profile.profile_photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                      ) : (
                        profile.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="font-bold text-lg truncate">{profile.full_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{profile.city || "Unknown Location"}</p>
                    </div>
                    <div className="text-right ml-4 relative z-10">
                      <div className="text-2xl font-black text-primary">{profile.reliability_score}%</div>
                      <div className="text-xs text-muted-foreground">Reliability</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState icon={Users} title="No Athletes Found" description="We couldn't find any athletes matching your criteria." />
            )
          ) : (
            performanceLeaders.length > 0 ? (
              <motion.div 
                initial="hidden" animate="show" 
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
                className="divide-y divide-white/5"
              >
                {performanceLeaders.map((record, i) => (
                  <motion.div 
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                    key={record.id} 
                    className={`flex items-center p-4 md:p-6 hover:bg-muted/20 transition-colors ${i < 3 ? 'bg-primary/5 relative overflow-hidden' : ''}`}
                  >
                    {i < 3 && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50 pointer-events-none" />}
                    <div className="w-8 md:w-12 text-center font-bold text-lg mr-4 relative z-10">
                      {i < 3 ? <Medal className={`w-8 h-8 mx-auto ${getMedalColor(i)}`} /> : <span className="text-muted-foreground">#{i + 1}</span>}
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary mr-4 shrink-0 overflow-hidden relative z-10 border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                      {record.profiles?.profile_photo_url ? (
                        <img src={record.profiles.profile_photo_url} alt={record.profiles.full_name} className="w-full h-full object-cover" />
                      ) : (
                        record.profiles?.full_name?.charAt(0) || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <h3 className="font-bold text-lg truncate">{record.profiles?.full_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{record.profiles?.city || "Unknown Location"}</p>
                    </div>
                    <div className="text-right ml-4 relative z-10">
                      <div className="text-2xl font-black text-primary">{record.metric_value} <span className="text-sm">{record.unit || ""}</span></div>
                      <div className="text-xs text-muted-foreground">{record.metric_name}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState icon={Trophy} title="No Records Found" description="No performance records exist for this metric yet." />
            )
          )}
        </div>
      )}
    </div>
  );
}
