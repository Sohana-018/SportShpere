"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Loader2 } from "lucide-react";
import Link from "next/link";
import { InteractiveMascot } from "@/components/InteractiveMascot";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const sportId = searchParams.get("sport");
  
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        
        if (error) throw error;
        
        // If a sport was passed via AI Matchmaker, save it as an interest
        if (sportId && data.user) {
          await supabase.from("athlete_sports").insert({
            user_id: data.user.id,
            sport_id: sportId,
            skill_level: "Beginner"
          });
        }
        
        // Redirect to discover page on success
        window.location.href = "/discover";
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        // Redirect to discover page on success
        window.location.href = "/discover";
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Visuals & Mascot */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-muted/20 border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
        
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity z-20">
          <Trophy className="w-8 h-8" />
          SportSphere
        </Link>

        <div className="relative z-10 flex flex-col items-center">
          <InteractiveMascot isBlindfolded={isPasswordFocused} />
          <h2 className="mt-6 text-3xl font-black text-center max-w-md">
            Join the ultimate sports networking platform
          </h2>
          <p className="mt-4 text-muted-foreground text-center max-w-sm">
            Find local games, track your performance, and climb the leaderboards.
          </p>
        </div>
      </div>
      
      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 bg-background relative">
        {/* Mobile Header (hidden on desktop) */}
        <Link href="/" className="lg:hidden absolute top-8 flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity z-20">
          <Trophy className="w-8 h-8" />
          SportSphere
        </Link>

        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          
          <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">{mode === "login" ? "Welcome back" : "Create an account"}</CardTitle>
              <CardDescription>
                {mode === "login" 
                  ? "Enter your credentials to access your account" 
                  : "Join the network and start playing today"}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3 text-sm text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    {success}
                  </div>
                )}
                
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="John Doe" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                      className="bg-background/50"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "login" && (
                      <Link href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    required 
                    className="bg-background/50"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {mode === "login" ? "Log in" : "Sign up"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    type="button" 
                    onClick={() => {
                      setMode(mode === "login" ? "signup" : "login");
                      setError(null);
                      setSuccess(null);
                    }} 
                    className="text-primary hover:underline font-medium"
                  >
                    {mode === "login" ? "Sign up" : "Log in"}
                  </button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
