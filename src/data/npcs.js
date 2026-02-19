/**
 * NPC definitions for combat.
 */

export const NPCS = {
  chicken: {
    id: 'chicken',
    name: 'Chicken',
    hitpoints: 3,
    attack: 1,
    strength: 1,
    defense: 1,
    attackSpeed: 3000, // 3.0 seconds
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 0
  }
};

export function getNpc(id) {
  return NPCS[id] || null;
}
