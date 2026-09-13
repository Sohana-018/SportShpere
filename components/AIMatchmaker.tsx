"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Search, ArrowRight, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Sport {
  id: string;
  name: string;
}

interface AIMatchmakerProps {
  sports: Sport[];
}

interface Recommendation {
  sport: Sport;
  reason: string;
}

export function AIMatchmaker({ sports }: AIMatchmakerProps) {
  const [textInput, setTextInput] = useState("");
  const [preferences, setPreferences] = useState({
    team: false,
    individual: false,
    casual: false,
    competitive: false,
  });
  
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Feature detection for Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setTextInput(prev => prev ? `${prev} ${transcript}` : transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setSpeechError("Microphone access denied. You can still type your answers.");
          } else {
            setSpeechError("Something went wrong with the microphone. Please try typing instead.");
          }
          // Clear error after a few seconds
          setTimeout(() => setSpeechError(null), 5000);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setSpeechError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
        setSpeechError("Could not start microphone.");
      }
    }
  };

  const handleCheckboxChange = (field: keyof typeof preferences) => (checked: boolean) => {
    setPreferences(prev => ({ ...prev, [field]: checked }));
  };

  const findSportByName = (nameMatch: string) => {
    return sports.find(s => s.name.toLowerCase().includes(nameMatch.toLowerCase()));
  };

  const generateRecommendations = () => {
    const text = textInput.toLowerCase();
    let matches: Recommendation[] = [];
    let matchedSportIds = new Set<string>();

    const addMatch = (sportNameMatch: string, reason: string) => {
      const sport = findSportByName(sportNameMatch);
      if (sport && !matchedSportIds.has(sport.id)) {
        matches.push({ sport, reason });
        matchedSportIds.add(sport.id);
      }
    };

    // Rule-based Keyword Matching
    if (text.includes("wheelchair") || text.includes("wheel chair") || text.includes("mobility")) {
      addMatch("Basketball", "A fast-paced team sport, very popular and played competitively worldwide in wheelchairs.");
      addMatch("Tennis", "An excellent individual or doubles sport that translates perfectly for wheelchair users.");
      addMatch("Table Tennis", "A precision-focused sport that's incredibly accessible and fun.");
      addMatch("Boccia", "A tactical precision sport originally designed for athletes with severe impairments.");
    } else if (text.includes("visual") || text.includes("blind")) {
      addMatch("Goalball", "A team sport specifically designed for visually impaired athletes.");
      addMatch("Swimming", "An excellent full-body sport that is highly accessible for visually impaired individuals.");
      addMatch("Judo", "A martial art relying on touch and balance, widely practiced by visually impaired athletes.");
      addMatch("Athletics", "Guided running and track events are highly popular and accessible.");
    } else if (text.includes("hearing") || text.includes("deaf")) {
      addMatch("Football", "A universal team sport where visual cues and teamwork shine.");
      addMatch("Basketball", "Fast-paced and highly visual, making it a great fit.");
      addMatch("Badminton", "An exciting racket sport that relies on sharp reflexes and visual tracking.");
      addMatch("Swimming", "A fantastic individual sport where hearing is rarely a barrier.");
    }

    // Checkbox Fallbacks (if fewer than 3 matches)
    if (matches.length < 3) {
      if (preferences.team) {
        addMatch("Football", "A highly popular team sport focused on coordination and strategy.");
        addMatch("Basketball", "Great for building teamwork and cardiovascular health.");
      }
      if (preferences.individual) {
        addMatch("Tennis", "A fantastic individual sport for agility and focus.");
        addMatch("Swimming", "Excellent for building endurance at your own pace.");
      }
      if (preferences.casual) {
        addMatch("Table Tennis", "A lower-impact game that's great for casual fun and sharp reflexes.");
        addMatch("Badminton", "Can be played casually and is highly accessible.");
      }
      if (preferences.competitive) {
        addMatch("Basketball", "Offers a highly competitive, fast-paced environment.");
        addMatch("Football", "Perfect if you're looking for high-intensity competitive matches.");
      }
    }

    // Default if absolutely nothing matches
    if (matches.length === 0 && sports.length > 0) {
      addMatch(sports[0].name, "One of our most popular sports in the community.");
      if (sports.length > 1) addMatch(sports[1].name, "A great way to get started and meet new people.");
    }

    // Limit to top 4
    setRecommendations(matches.slice(0, 4));
    setHasSearched(true);
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-6 md:p-10 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
      
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">AI Matchmaker</Badge>
          <h2 className="text-3xl font-extrabold mb-4">Find Your Perfect Sport</h2>
          <p className="text-muted-foreground text-lg">
            Not sure where to start? Tell us a bit about yourself and your preferences, and we'll suggest sports that'll work well for you.
          </p>
        </div>

        <div className="space-y-8 bg-background/50 border border-border p-6 rounded-2xl shadow-inner">
          {/* Step 1: Text Input */}
          <div className="space-y-3">
            <Label htmlFor="accessibility-needs" className="text-base font-semibold">
              1. Tell us a bit about yourself (Optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Do you have any specific needs or preferences we should know about? (e.g., wheelchair user, visually impaired)
            </p>
            <div className="flex gap-2">
              <Input
                id="accessibility-needs"
                placeholder="Type here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="flex-1 focus-visible:ring-2 focus-visible:ring-primary/50"
                onKeyDown={(e) => { if (e.key === 'Enter') generateRecommendations(); }}
              />
              {speechSupported && (
                <Button 
                  type="button" 
                  variant={isListening ? "default" : "outline"}
                  className={`shrink-0 w-12 p-0 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse border-red-500 text-white' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Start voice input"}
                  aria-label={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              )}
            </div>
            {speechError && (
              <p className="text-sm text-amber-500 animate-in fade-in">{speechError}</p>
            )}
          </div>

          {/* Step 2: Checkboxes */}
          <div className="space-y-4">
            <Label className="text-base font-semibold block mb-3">
              2. What kind of sport interests you?
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-xl border border-border hover:border-primary/50 transition-colors shadow-sm">
                <Checkbox 
                  id="pref-team" 
                  checked={preferences.team} 
                  onCheckedChange={handleCheckboxChange("team")} 
                  className="focus-visible:ring-2 focus-visible:ring-primary/50"
                />
                <Label htmlFor="pref-team" className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Team sport
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-muted/20 p-3 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                <Checkbox 
                  id="pref-individual" 
                  checked={preferences.individual} 
                  onCheckedChange={handleCheckboxChange("individual")} 
                  className="focus-visible:ring-2 focus-visible:ring-primary/50"
                />
                <Label htmlFor="pref-individual" className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Individual sport
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-muted/20 p-3 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                <Checkbox 
                  id="pref-casual" 
                  checked={preferences.casual} 
                  onCheckedChange={handleCheckboxChange("casual")} 
                  className="focus-visible:ring-2 focus-visible:ring-primary/50"
                />
                <Label htmlFor="pref-casual" className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Low-impact / Casual
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-muted/20 p-3 rounded-xl border border-white/5 hover:border-primary/20 transition-colors">
                <Checkbox 
                  id="pref-competitive" 
                  checked={preferences.competitive} 
                  onCheckedChange={handleCheckboxChange("competitive")} 
                  className="focus-visible:ring-2 focus-visible:ring-primary/50"
                />
                <Label htmlFor="pref-competitive" className="flex-1 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Competitive
                </Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={generateRecommendations} 
            className="w-full sm:w-auto shadow-lg shadow-primary/25 h-12 px-8 focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Search className="w-4 h-4 mr-2" />
            Find My Sport
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-bottom-6 duration-500 fade-in">
            <h3 className="text-2xl font-bold border-b border-white/10 pb-4">Recommended For You</h3>
            
            {recommendations.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.sport.id} className="bg-primary/5 border border-primary/20 rounded-2xl p-5 hover:bg-primary/10 transition-colors flex flex-col justify-between group">
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-foreground">{rec.sport.name}</h4>
                      <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                        {rec.reason}
                      </p>
                    </div>
                    <Link 
                      href={`/discover?sport=${rec.sport.id}`} 
                      className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md p-1 -ml-1 transition-colors"
                    >
                      <PlayCircle className="w-4 h-4 mr-1.5" />
                      View local games
                      <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-muted/20 rounded-xl">
                <p className="text-muted-foreground">We couldn't find an exact match, but check out our full Discover page for more options!</p>
              </div>
            )}
            
            <div className="pt-6 text-center">
              <Link href={`/login?mode=signup${recommendations.length > 0 ? `&sport=${recommendations[0].sport.id}` : ''}`}>
                <Button size="lg" className="rounded-full shadow-lg shadow-primary/25 focus-visible:ring-2 focus-visible:ring-primary/50">
                  Sign up to save your interests and get matched with local games
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
