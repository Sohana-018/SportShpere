"use client";

import { MapPin, Calendar, Users, Trophy } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";

interface EventCardProps {
  event: any;
  publicView?: boolean;
}

export function EventCard({ event, publicView = false }: EventCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col hover:bg-accent/5 transition-colors overflow-hidden border-white/10 shadow-lg group relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <CardHeader className="p-0">
          <div className="h-32 bg-gradient-to-br from-primary/40 via-primary/20 to-background flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <Trophy className="w-12 h-12 text-primary/50" />
            <Badge className="absolute top-4 right-4 bg-background/80 backdrop-blur text-foreground border-white/10 hover:bg-background/90">
              {event.sports?.name || "Sport"}
            </Badge>
          </div>
        </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-xl line-clamp-1">{event.title}</h3>
            <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" />
              {event.location} {event.area ? `• ${event.area}` : ""}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{event.event_date ? format(new Date(event.event_date), "MMM d, h:mm a") : "TBD"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4 text-primary" />
            <span>
              {event.max_participants ? `Up to ${event.max_participants} players` : "Open"}
            </span>
          </div>
        </div>
        
        {event.skill_level && (
          <Badge variant="outline" className="text-xs">
            {event.skill_level}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 flex gap-3">
        {publicView ? (
          <Link href="/login" className={buttonVariants({ className: "w-full" })}>Log in to join</Link>
        ) : (
          <Link href={`/events/${event.id}`} className={buttonVariants({ className: "w-full" })}>View Details</Link>
        )}
      </CardFooter>
    </Card>
    </motion.div>
  );
}
