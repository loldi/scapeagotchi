/**
 * Global game state. Single source of truth for the current session.
 */

import { createPlayer } from './player.js';

let player = null;

export function initGameState() {
  player = createPlayer();
  return player;
}

export function getPlayer() {
  if (!player) player = createPlayer();
  return player;
}
