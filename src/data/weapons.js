/**
 * Weapon definitions with attack speeds (in milliseconds).
 * Based on OSRS attack speeds.
 */

export const WEAPONS = {
  unarmed: {
    id: 'unarmed',
    name: 'Unarmed',
    attackSpeed: 2400, // 2.4 seconds
    attackBonus: 0,
    strengthBonus: 0
  },
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    attackSpeed: 3000, // 3.0 seconds
    attackBonus: 7,
    strengthBonus: 4
  },
  longsword: {
    id: 'longsword',
    name: 'Longsword',
    attackSpeed: 3600, // 3.6 seconds
    attackBonus: 18,
    strengthBonus: 19
  },
  debug_dagger: {
    id: 'debug_dagger',
    name: '[DEBUG] Insta-kill Dagger',
    attackSpeed: 1200, // Fast for testing
    attackBonus: 999,
    strengthBonus: 999,
    debugInstaKill: true
  }
};

export function getWeapon(id) {
  return WEAPONS[id] || WEAPONS.unarmed;
}
