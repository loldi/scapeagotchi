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
  bronze_pickaxe: {
    id: 'bronze_pickaxe',
    name: 'Bronze pickaxe',
    type: 'tool',
    stackable: false
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper ore',
    type: 'resource',
    stackable: true,
    maxStack: 999
  },
  tin_ore: {
    id: 'tin_ore',
    name: 'Tin ore',
    type: 'resource',
    stackable: true,
    maxStack: 999
  },
  bronze_bar: {
    id: 'bronze_bar',
    name: 'Bronze bar',
    type: 'resource',
    stackable: true,
    maxStack: 999
  },
  bronze_dagger: {
    id: 'bronze_dagger',
    name: 'Bronze dagger',
    type: 'weapon',
    stackable: false
  },
  bronze_cap: {
    id: 'bronze_cap',
    name: 'Bronze cap',
    type: 'armour',
    stackable: false
  },
  bronze_shorts: {
    id: 'bronze_shorts',
    name: 'Bronze shorts',
    type: 'armour',
    stackable: false
  },
  bronze_round_shield: {
    id: 'bronze_round_shield',
    name: 'Bronze round shield',
    type: 'armour',
    stackable: false
  }
};

/** Smelting recipes: barId -> { ores: [{ itemId, amount }], barAmount } */
export const SMELT_RECIPES = {
  bronze_bar: {
    ores: [
      { itemId: 'copper_ore', amount: 1 },
      { itemId: 'tin_ore', amount: 1 }
    ],
    barAmount: 1
  }
};

/** Anvil recipes: barId -> [ { itemId, bars, smithingLevel } ] */
export const ANVIL_RECIPES = {
  bronze_bar: [
    { itemId: 'bronze_dagger', bars: 1, smithingLevel: 1 },
    { itemId: 'bronze_cap', bars: 1, smithingLevel: 1 },
    { itemId: 'bronze_shorts', bars: 2, smithingLevel: 1 },
    { itemId: 'bronze_round_shield', bars: 2, smithingLevel: 1 }
  ]
};

export function getItem(id) {
  return ITEMS[id] || null;
}
