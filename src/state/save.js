/**
 * Save/load game state to localStorage for persistence across sessions.
 */

import { getPlayer } from './gameState.js';

const SAVE_KEY = 'scapeagochi_save';
let currentSceneKey = null;

export function setCurrentScene(key) {
  currentSceneKey = key;
}

export function saveGame(lastSceneKey = null) {
  try {
    const player = getPlayer();
    const sceneKey = lastSceneKey ?? currentSceneKey;
    const data = {
      player: JSON.parse(JSON.stringify(player)),
      lastScene: sceneKey,
      timestamp: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load game:', e);
    return null;
  }
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) != null;
}

export function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    console.warn('Failed to clear save:', e);
  }
}
