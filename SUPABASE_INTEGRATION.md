# Supabase Integration - Player Data Sync

This document describes the Supabase integration for syncing player progression data.

## Overview

The game now automatically syncs player progression data to a Supabase database. Each player gets a unique, persistent ID that survives game resets, allowing their overall progression to be tracked across sessions.

## Features

- **Persistent Player ID**: Each player gets a unique UUID that persists in localStorage even when the game is reset
- **Automatic Data Sync**: Player data is automatically synced after:
  - Daily progression (Next Day)
  - Shop purchases
  - Fever cure actions
  - Game reset
- **Tracked Metrics**:
  - Number of achievements unlocked
  - Count of rabbits by breed (common, rare, legendary)
  - Current coins
  - Total rabbits born
  - Total coins earned

## Database Schema

The `player_progress` table contains:

```sql
- player_id (UUID, Primary Key) - Unique player identifier
- achievements_count (INTEGER) - Number of achievements unlocked
- rabbits_common (INTEGER) - Count of common rabbits
- rabbits_rare (INTEGER) - Count of rare rabbits  
- rabbits_legendary (INTEGER) - Count of legendary rabbits
- current_coins (INTEGER) - Current coin balance
- total_rabbits_born (INTEGER) - Lifetime rabbits born
- total_coins_earned (INTEGER) - Lifetime coins earned
- last_updated (TIMESTAMP) - Last sync timestamp
- created_at (TIMESTAMP) - Player creation timestamp
```

## Environment Variables

The following environment variables are required in `.env.local`:

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

## Implementation Files

- `src/lib/supabase.ts` - Supabase client configuration
- `src/utils/playerId.ts` - Player ID generation and persistence
- `src/services/playerDataSync.ts` - Data synchronization service
- `src/contexts/GameContext.tsx` - Integration with game state

## Viewing Player ID

Players can view their unique ID in the Statistics panel, which shows:
- The player's persistent ID
- Confirmation that data is synced with the database

## Privacy & Data

- Player IDs are randomly generated UUIDs
- Only game progression statistics are stored
- No personal information is collected
- Row Level Security (RLS) is enabled on the database table
