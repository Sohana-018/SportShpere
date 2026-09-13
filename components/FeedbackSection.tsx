"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Star, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface Participant {
  user_id: string;
  status: string;
  profiles: {
    id: string;
    full_name: string;
    profile_photo_url: string;
  };
}

interface FeedbackSectionProps {
  eventId: string;
  eventDate: string;
  participants: Participant[];
}

interface FeedbackFormState {
  punctuality: number;
  sportsmanship: number;
  fair_play: number;
  performance: number;
  comment: string;
}

const DEFAULT_FORM: FeedbackFormState = {
  punctuality: 3,
  sportsmanship: 3,
  fair_play: 3,
  performance: 3,
  comment: "",
};

function RatingSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-muted-foreground capitalize">{label}</label>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-4 h-4 ${
                  star <= value ? "fill-primary text-primary" : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackSection({ eventId, eventDate, participants }: FeedbackSectionProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isPast, setIsPast] = useState(false);
  const [submittedFor, setSubmittedFor] = useState<Set<string>>(new Set());
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, FeedbackFormState>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const init = async () => {
      // Check if event is in the past
      if (eventDate && new Date(eventDate) < new Date()) {
        setIsPast(true);
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return;
      const uid = userData.user.id;
      setCurrentUserId(uid);

      // Check if current user is a participant
      const joined = participants.some((p) => p.user_id === uid && p.status === "joined");
      setIsParticipant(joined);

      if (!joined) return;

      // Fetch existing feedback rows this user has already submitted for this event
      const { data: existing } = await supabase
        .from("game_feedback")
        .select("reviewed_user_id")
        .eq("event_id", eventId)
        .eq("reviewer_id", uid);

      if (existing && existing.length > 0) {
        setSubmittedFor(new Set(existing.map((r: any) => r.reviewed_user_id)));
      }
    };
    init();
  }, [eventId, eventDate, participants]);

  const joinedParticipants = participants.filter((p) => p.status === "joined");

  const handleRatingChange = (userId: string, field: keyof FeedbackFormState, value: number | string) => {
    setForms((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] ?? DEFAULT_FORM),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (targetUser: Participant) => {
    if (!currentUserId) return;
    const form = forms[targetUser.user_id] ?? DEFAULT_FORM;
    setSubmitting(true);
    setErrors((prev) => ({ ...prev, [targetUser.user_id]: "" }));

    try {
      // Double-check no existing row (guard against double submission)
      const { data: existing } = await supabase
        .from("game_feedback")
        .select("id")
        .eq("event_id", eventId)
        .eq("reviewer_id", currentUserId)
        .eq("reviewed_user_id", targetUser.user_id)
        .maybeSingle();

      if (existing) {
        setSubmittedFor((prev) => new Set([...prev, targetUser.user_id]));
        setOpenForm(null);
        return;
      }

      const { error } = await supabase.from("game_feedback").insert({
        event_id: eventId,
        reviewer_id: currentUserId,
        reviewed_user_id: targetUser.user_id,
        punctuality: form.punctuality,
        sportsmanship: form.sportsmanship,
        fair_play: form.fair_play,
        performance: form.performance,
        comment: form.comment || null,
      });

      if (error) throw error;

      setSubmittedFor((prev) => new Set([...prev, targetUser.user_id]));
      setOpenForm(null);
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        [targetUser.user_id]: err.message || "Failed to submit feedback.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render anything feedback-related if event hasn't passed or user isn't a participant
  const showFeedback = isPast && isParticipant;

  return (
    <div className="space-y-3">
      {joinedParticipants.map((p) => {
        const isSelf = p.user_id === currentUserId;
        const alreadySubmitted = submittedFor.has(p.user_id);
        const isOpen = openForm === p.user_id;
        const form = forms[p.user_id] ?? DEFAULT_FORM;

        return (
          <div key={p.user_id} className="rounded-xl border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-2 hover:bg-muted/50 transition-colors group">
              <Link href={`/profiles/${p.user_id}`} className="flex items-center gap-3 flex-1">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={p.profiles?.profile_photo_url} />
                  <AvatarFallback>{p.profiles?.full_name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{p.profiles?.full_name}</span>
              </Link>

              <div className="flex items-center gap-1">
                {!isSelf && (
                  <Link
                    href={`/messages/${p.user_id}`}
                    className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-primary-foreground transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                )}

                {showFeedback && !isSelf && (
                  alreadySubmitted ? (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium px-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reviewed</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenForm(isOpen ? null : p.user_id)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Rate
                      {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Feedback Form */}
            {isOpen && !alreadySubmitted && (
              <div className="px-4 pb-4 pt-2 bg-muted/20 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  Rate {p.profiles?.full_name}
                </p>

                <div className="space-y-3">
                  {(["punctuality", "sportsmanship", "fair_play", "performance"] as const).map((field) => (
                    <RatingSlider
                      key={field}
                      label={field.replace("_", " ")}
                      value={form[field] as number}
                      onChange={(v) => handleRatingChange(p.user_id, field, v)}
                    />
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Comment (optional)</label>
                  <textarea
                    value={form.comment}
                    onChange={(e) => handleRatingChange(p.user_id, "comment", e.target.value)}
                    placeholder="Great game! Very punctual..."
                    className="w-full bg-background/50 border border-white/10 rounded-lg p-2 text-sm resize-none min-h-[70px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {errors[p.user_id] && (
                  <p className="text-destructive text-xs">{errors[p.user_id]}</p>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpenForm(null)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSubmit(p)}
                    disabled={submitting}
                    className="shadow-md shadow-primary/25"
                  >
                    {submitting ? "Submitting…" : "Submit Feedback"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {joinedParticipants.length === 0 && (
        <p className="text-sm text-muted-foreground italic text-center py-4">No players joined yet</p>
      )}

      {isPast && !isParticipant && joinedParticipants.length > 0 && currentUserId && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          Only participants can leave feedback.
        </p>
      )}
    </div>
  );
}
