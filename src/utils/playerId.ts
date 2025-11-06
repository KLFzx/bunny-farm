/**
 * Player ID Management
 * Generates and persists a unique player ID that survives game resets
 */

const PLAYER_ID_KEY = 'rabbitTycoon_playerId';

/**
 * Generates a UUID v4 compliant player ID
 */
function generatePlayerId(): string {
  // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets or creates a persistent player ID
 * This ID is stored separately from game save data and persists across resets
 */
export function getOrCreatePlayerId(): string {
  let playerId = localStorage.getItem(PLAYER_ID_KEY);
  
  if (!playerId) {
    playerId = generatePlayerId();
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  
  return playerId;
}

/**
 * Gets the current player ID without creating one
 */
export function getPlayerId(): string | null {
  return localStorage.getItem(PLAYER_ID_KEY);
}
