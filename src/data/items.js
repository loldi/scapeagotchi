/**
 * Item definitions. Per DESIGN.md Phase 1.
 */

export const ITEMS = {
  raw_chicken: {
    id: 'raw_chicken',
    name: 'Raw chicken',
    type: 'food',
    stackable: true,
    maxStack: 999,
    cookResult: 'cooked_chicken',
    cookLevel: 1
  },
  cooked_chicken: {
    id: 'cooked_chicken',
    name: 'Cooked chicken',
    type: 'food',
    stackable: true,
    maxStack: 999,
    hungerRestore: 10
  },
  raw_beef: {
    id: 'raw_beef',
    name: 'Raw beef',
    type: 'food',
    stackable: true,
    maxStack: 999,
    cookResult: 'cooked_beef',
    cookLevel: 1
  },
  cooked_beef: {
    id: 'cooked_beef',
    name: 'Cooked beef',
    type: 'food',
    stackable: true,
    maxStack: 999,
    hungerRestore: 15
  },
  bones: {
    id: 'bones',
    name: 'Bones',
    type: 'resource',
    stackable: true,
    maxStack: 999
  },
  feathers: {
    id: 'feathers',
    name: 'Feathers',
    type: 'resource',
    stackable: true,
    maxStack: 999
  },
  egg: {
    id: 'egg',
    name: 'Egg',
    type: 'food',
    stackable: true,
    maxStack: 999
  },
  debug_dagger: {
    id: 'debug_dagger',
    name: '[DEBUG] Insta-kill Dagger',
    type: 'weapon',
    stackable: false,
    weaponId: 'debug_dagger'
  }
};

export function getItem(id) {
  return ITEMS[id] || null;
}
