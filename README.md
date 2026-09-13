# SportSphere

SportSphere is a unified sports networking and discovery platform designed to handle multiple, vastly different sports gracefully without becoming cluttered.

## How We Handle Multiple, Very Different Sports
SportSphere uses a flexible, relational data structure. Instead of hardcoding fields for specific sports, we separate core user identity from sport-specific profiles. An athlete can add multiple sports to their profile (e.g., Basketball, Chess, Swimming) via an `athlete_sports` relationship, defining their individual skill level for each. 

Furthermore, the **Performance Tracker** uses a generic key-value `performance_records` system. Instead of rigid columns like "lap_time" or "chess_rating", users define a `metric_name` and `metric_value` linked to a specific sport ID. This means the app effortlessly adapts: a swimmer can log "50m Freestyle Time: 28s", while a chess player logs "ELO Rating: 1500" using the exact same underlying architecture.

## Features

### Must-Have Features
* **Athlete Profile**: Users can manage their bio, city, and list the sports they play along with their skill levels.
* **Discovery & Search**: Athletes and upcoming events are easily discoverable. You can filter by sport, city, reliability score, and even time availability.
* **Events & Matches**: Create local pickup games, practices, or tournaments. Other users can join these events with a click.
* **Direct Messaging**: Once athletes find each other (via Discovery or Event participant lists), they can directly message each other using the in-app chat.
* **Unified Profile Architecture**: (See explanation above)

### Bonus Features Included
* **Dynamic Performance Tracker**: A specialized tracker on the profile page that adapts to the sport selected, allowing users to log custom metrics and see their history.
* **Leaderboards**: Dedicated leaderboards for both Reliability (platform trust) and Performance (best recorded metrics per sport).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
