import { supabase, PlayerProgress } from '@/lib/supabase';
import { GameState, RabbitWithBreed } from '@/contexts/GameContext';
import { getOrCreatePlayerId } from '@/utils/playerId';

/**
 * Counts rabbits by breed type
 */
function countRabbitsByBreed(rabbits: RabbitWithBreed[]) {
  return rabbits.reduce(
    (acc, rabbit) => {
      acc[rabbit.breed] = (acc[rabbit.breed] || 0) + 1;
      return acc;
    },
    { common: 0, rare: 0, legendary: 0 } as Record<string, number>
  );
}

/**
 * Updates the player's display name in Supabase and localStorage
 */
export async function updatePlayerName(name: string): Promise<void> {
  try {
    const player_id = getOrCreatePlayerId();
    localStorage.setItem('rabbitTycoon_playerName', name);
    const { error } = await supabase
      .from('player_progress')
      .upsert(
        {
          player_id,
          player_name: name,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'player_id' }
      );
    if (error) throw error;
  } catch (e) {
    console.error('Failed to update player name', e);
  }
}

/**
 * Converts game state to player progress data
 */
export function gameStateToPlayerProgress(gameState: GameState): Omit<PlayerProgress, 'player_id' | 'created_at' | 'last_updated'> {
  const rabbitCounts = countRabbitsByBreed(gameState.rabbits);
  
  return {
    achievements_count: gameState.unlockedAchievements.length,
    achievements: [...(gameState.unlockedAchievements || [])],
    day: gameState.day,
    house_capacity: Math.floor(gameState.houses * (4 + (gameState.capacityBonusPerHouse || 0))),
    rabbits_common: rabbitCounts.common || 0,
    rabbits_rare: rabbitCounts.rare || 0,
    rabbits_legendary: rabbitCounts.legendary || 0,
    current_coins: gameState.coins,
    total_rabbits_born: gameState.totalRabbitsBorn,
    total_coins_earned: gameState.totalCoinsEarned,
  };
}

/**
 * Syncs player progress to Supabase
 */
export async function syncPlayerProgress(gameState: GameState): Promise<void> {
  try {
    const playerId = getOrCreatePlayerId();
    const progressData = gameStateToPlayerProgress(gameState);
    const player_name = localStorage.getItem('rabbitTycoon_playerName') || undefined;
    // Compute current total rabbits
    const currentTotalRabbits = (progressData.rabbits_common || 0) + (progressData.rabbits_rare || 0) + (progressData.rabbits_legendary || 0);

    // Fetch existing to compare best rabbits
    const { data: existingRow, error: fetchErr } = await supabase
      .from('player_progress')
      .select('rabbits_common, rabbits_rare, rabbits_legendary')
      .eq('player_id', playerId)
      .single();
    if (fetchErr && fetchErr.code !== 'PGRST116') {
      console.warn('Non-fatal: failed to read existing progress before sync', fetchErr);
    }
    const existingTotalRabbits = existingRow ? ((existingRow.rabbits_common || 0) + (existingRow.rabbits_rare || 0) + (existingRow.rabbits_legendary || 0)) : 0;

    // Only update if we improved total rabbits
    if (currentTotalRabbits > existingTotalRabbits) {
      const { error } = await supabase
        .from('player_progress')
        .upsert(
          {
            player_id: playerId,
            ...progressData,
            ...(player_name ? { player_name } : {}),
            last_updated: new Date().toISOString(),
          },
          { onConflict: 'player_id' }
        );
      if (error) {
        console.error('Error syncing player progress:', error);
        throw error;
      }
      console.log('Player progress synced (improved rabbits).');
    } else {
      console.log('Skipped sync: rabbits not improved (keeping best on leaderboard).');
    }
    
    console.log('Player progress synced successfully');
  } catch (error) {
    console.error('Failed to sync player progress:', error);
    // Don't throw - we don't want to break the game if sync fails
  }
}

/**
 * Fetches player progress from Supabase
 */
export async function fetchPlayerProgress(): Promise<PlayerProgress | null> {
  try {
    const playerId = getOrCreatePlayerId();
    
    const { data, error } = await supabase
      .from('player_progress')
      .select('*')
      .eq('player_id', playerId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return null
        return null;
      }
      console.error('Error fetching player progress:', error);
      throw error;
    }
    
    return data as PlayerProgress;
  } catch (error) {
    console.error('Failed to fetch player progress:', error);
    return null;
  }
}

/**
 * Initializes player progress in database if it doesn't exist
 */
export async function initializePlayerProgress(gameState: GameState): Promise<void> {
  try {
    const existing = await fetchPlayerProgress();
    
    if (!existing) {
      await syncPlayerProgress(gameState);
    }
  } catch (error) {
    console.error('Failed to initialize player progress:', error);
  }
}
