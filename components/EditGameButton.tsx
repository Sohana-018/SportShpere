"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { EditGameModal } from "./EditGameModal";
import { supabase } from "@/app/lib/supabase";

interface EditGameButtonProps {
  event: any;
  sports: any[];
}

export function EditGameButton({ event, sports }: EditGameButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkCreator = async () => {
      const { data: userData } = await supabase.auth.getUser();
      // event.profiles?.id comes from the profiles:created_by relation in the query
      if (userData?.user?.id && userData.user.id === event.profiles?.id) {
        setIsCreator(true);
      }
    };
    checkCreator();
  }, [event.profiles?.id]);

  if (!isCreator) return null;

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsModalOpen(true)}
        className="gap-2 bg-background/50 backdrop-blur border-white/10 hover:bg-white/10"
      >
        <Settings className="w-4 h-4" />
        Edit Event
      </Button>

      {isModalOpen && (
        <EditGameModal 
          open={isModalOpen} 
          onOpenChange={setIsModalOpen} 
          event={event} 
          sports={sports} 
        />
      )}
    </>
  );
}
