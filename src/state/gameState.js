/**
 * Global game state. Single source of truth for the current session.
 */

import { createPlayer } from './player.js';

let player = null;

export function initGameState(savedPlayer = null) {
  if (savedPlayer && typeof savedPlayer === 'object') {
    player = savedPlayer;
    if (!player.stats) player.stats = {};
    if (!player.inventory) player.inventory = [];
    if (!player.equipment) player.equipment = createPlayer().equipment;
  } else {
    player = createPlayer();
  }
  return player;
}

export function getPlayer() {
  if (!player) player = createPlayer();
  return player;
}
