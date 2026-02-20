/**
 * Player state and stats.
 * Per DESIGN.md: Hitpoints starts at 10, all others at 1.
 */

export const STAT_IDS = [
  'attack', 'strength', 'defense', 'hitpoints', 'prayer', 'magic', 'ranged',
  'cooking', 'fishing', 'mining', 'smithing', 'crafting', 'hunting', 'agility'
];

export function createStat(level, xp = 0, current = null) {
  const stat = { level, xp };
  if (current !== null) stat.current = current; // for hitpoints, prayer
  return stat;
}

export function createPlayer() {
  const stats = {};
  for (const id of STAT_IDS) {
    if (id === 'hitpoints') {
      stats[id] = createStat(10, 0, 10); // level 10, current HP 10
    } else if (id === 'prayer') {
      stats[id] = createStat(1, 0, 0); // prayer points pool
    } else {
      stats[id] = createStat(1, 0);
    }
  }

  return {
    stats,
    gold: 100,
    inventory: [], // { itemId, quantity } per slot, max 28
    equipment: {
      weapon: null,
      offhand: null,
      head: null,
      body: null,
      legs: null,
      feet: null,
      hands: null,
      cape: null,
      ammo: null
    },
    hunger: 100,
    renown: 0,
    experience: 0 // Total experience gained
  };
}
