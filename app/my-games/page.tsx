import { supabase } from "@/app/lib/supabase";
import { redirect } from "next/navigation";
import MyGamesClient from "./MyGamesClient";
import { PageHeaderBackground } from "@/components/PageHeaderBackground";

export const revalidate = 0;

export default function MyGamesPage() {
  return (
    <div className="relative min-h-screen">
      <PageHeaderBackground />
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-5xl">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          My Games
        </h1>
        <MyGamesClient />
      </div>
    </div>
  );
}
