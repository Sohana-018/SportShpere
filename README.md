# SportSphere

SportSphere is a unified sports networking and discovery platform where athletes across any sport — from traditional sports like cricket and football to niche games like chess and boccia — can build a profile, find matches, and connect with other athletes and coaches.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres, Auth, Realtime)
- **Deployment**: Vercel

## How We Handle Multiple, Very Different Sports

SportSphere uses a flexible, relational data structure instead of hardcoding fields per sport. Core identity (profiles) is separated from sport-specific data: an athlete links to any number of sports via `athlete_sports`, each with its own skill level.

The **Performance Tracker** goes further with a generic key-value system (`performance_records`): rather than rigid columns like `lap_time` or `chess_rating`, users log a `metric_name` and `metric_value` tied to a sport. A swimmer logs "50m Freestyle: 28s," a chess player logs "ELO Rating: 1500" — using the same underlying table, no schema changes needed per sport.

Trust and reliability work the same way across sports: after any event, participants rate each other via `game_feedback`, which automatically recalculates each athlete's `reliability_score` — a single trust signal that works whether the event was a cricket match or a chess meetup.

## Core Features

- **Vibrant Modern UI** — built with electric blues/purples, glassmorphism overlays, and smooth micro-animations.
- **AI Matchmaker** — an intelligent, accessible questionnaire (featuring Web Speech API voice input) on the landing page that suggests the perfect sports based on your preferences, accessibility needs, and intensity levels. 
- **Athlete Profiles** — bios, location info, and sports played with skill badges (Beginner / Intermediate / Pro).
- **Discovery and Search** — find athletes and events, filterable by sport, city, availability, reliability score, and **age range**.
- **Events and Matches** — create, join, and edit local pickup games, practices, and tournaments.
- **My Games Dashboard** — easily track upcoming matches and view past games, including dynamic prompts reminding you to leave feedback for teammates.
- **Reliability System** — after an event, participants rate each other on punctuality, sportsmanship, fair play, and performance, which updates each athlete's trust score.
- **Direct Messaging** — realtime 1:1 chat between connected athletes.
- **Performance Tracker** — sport-agnostic metric logging with a personal history view.
- **Leaderboards** — ranked by reliability score or by a specific performance metric, filterable by sport and city.
- **Coach/Mentor Matching** — coaches can be discovered and filtered separately from athlete-to-athlete matches.
- **Community Feed** — a global feed for posting updates and achievements.

## Getting Started

1. Clone the repo and install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the project root with your Supabase project credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```
*(Find these in your Supabase dashboard under Project Settings → API.)*

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
