# Scapeagotchi — Design Document

## 1. Overview

Scapeagotchi is a casual Tamagotchi-style pixel art game where players raise a "noob" into a legend through care, combat, skilling, and adventure. This document defines the core systems for the initial prototype: stats, combat, food acquisition, inventory, and equipment.

---

## 2. Stats System

### 2.1 Combat Stats

| Stat | Purpose | Starting Value |
|------|---------|----------------|
| **Attack** | Determines accuracy rolls against opponents | 1 |
| **Strength** | Determines maximum hit/damage rolls against opponents | 1 |
| **Defense** | Flat damage reduction against incoming attacks | 1 |
| **Hitpoints** | Total health pool; at 0, combat ends (knockout/respawn) | 10 |
| **Prayer** | Prayer points pool; determines which prayers can be used | 1 |
| **Magic** | Determines which spells are available and their effectiveness | 1 |
| **Ranged** | Determines which ranged weapons/ammo can be used | 1 |

### 2.2 Skilling Stats

| Stat | Purpose | Starting Value |
|------|---------|----------------|
| **Cooking** | Determines which foods can be made and cooking success chance | 1 |
| **Fishing** | Determines which fish can be caught | 1 |
| **Mining** | Determines which ores can be mined | 1 |
| **Smithing** | Determines which metal equipment can be crafted from ores | 1 |
| **Crafting** | Determines non-metal combat gear and skilling equipment | 1 |
| **Hunting** | Determines which animals can be hunted/trapped | 1 |
| **Agility** | Determines successful evasion/avoidance of incoming attacks | 1 |

### 2.3 Stat Progression

- Stats gain XP through use (combat, gathering, crafting, etc.).
- XP thresholds define levels (e.g. level 2, 3, …).
- Exact XP curves TBD; can follow a simple formula (e.g. `level = floor(sqrt(xp) / k) + 1`).

---

## 3. Combat System (Basic)

### 3.1 Flow

1. Player selects a target (mob) or enters combat (e.g. clicks "Fight chickens").
2. Combat runs in rounds/turns or as a simple action loop.
3. Each round:
   - **Accuracy roll**: Attack vs. target Defense (or evasion) → hit or miss.
   - **Damage roll**: On hit, Strength (and weapon) vs. target Defense → damage dealt.
   - **Defense**: Target's Defense reduces flat damage (e.g. `damage = max(0, roll - targetDefense)`).
   - **Evasion**: Agility can convert some hits into misses (dodge) before damage.
4. Target (or player) reaches 0 HP → combat ends.

### 3.2 Accuracy

- Formula: `hitChance = f(playerAttack, weaponAccuracy, targetDefense)`.
- Example: `hitChance = attackLevel / (attackLevel + targetDefense)` or similar.
- Roll 0–1; if below `hitChance`, attack hits.

### 3.3 Damage

- On hit: `damage = max(1, damageRoll - targetDefense)`.
- `damageRoll` derived from Strength, weapon, and maybe a small random range.
- Minimum 1 damage per successful hit (so low-level players can still progress).

### 3.4 Evasion (Agility)

- Before damage: `evadeChance = f(playerAgility, attacker)`.
- Roll; on success, attack misses (0 damage).
- Evasion checked after accuracy roll, before damage calculation.

### 3.5 Loot

- Drops determined by mob type (e.g. raw chicken, raw beef, bones).
- Future: loot tables per mob, rarity tiers.

---

## 4. Food & Acquisition System

### 4.1 Design Principles

- **No passive decay** while offline. Hunger only changes during active play.
- **Hunger as activity cost**: combat, quests, skilling consume hunger over time.
- **Food enables play**: low hunger slows gains or blocks activities; food restores capacity.
- **Progression toward autonomy**: early manual gathering, later unlocks for passive/auto options.

### 4.2 Tutorial Loop

1. Kill chickens or cows → receive raw chicken / raw beef.
2. Use a cooking station (e.g. campfire) → cook raw food.
3. Eat cooked food → restore hunger (and optionally give a small bonus).
4. Use restored hunger to continue combat, quests, or skilling.

### 4.3 Food Acquisition Paths

| Path | Early Game | Mid Game | Late Game |
|------|------------|----------|-----------|
| **Combat** | Manual kill cows/chickens | Kill pigs, sheep for meat | Auto-collect meat from combat based on level |
| **Fishing** | Manual basic fish | Better fish at higher Fishing | Auto-fishing (slower, AFK) |
| **Hunting** | Trap rabbits | Kebbits, antelope, kyatts | Higher-tier traps, passive catches |

### 4.4 Cooking

- Cooking level gates which foods can be made.
- Success chance: `f(Cooking level, recipe difficulty)`.
- Failure: burn food (useless or reduced effect).
- Raw → cooked transformation is the core food pipeline.

---

## 5. Inventory System

### 5.1 Structure

- **Slots**: Fixed number of inventory slots (e.g. 28).
- **Stacking**: Stackable items (ores, food, resources) share a slot up to a max stack size.
- **Non-stackable**: Equipment, tools, unique items use one slot each.

### 5.2 Item Types

| Type | Stackable | Notes |
|------|-----------|-------|
| Food | Yes (same type) | Cooked/raw |
| Resources | Yes | Ores, logs, fish, hides |
| Equipment | No | Weapons, armor, tools |
| Quest/Unique | No | Special items |

### 5.3 Actions

- Pick up drops (auto or manual).
- Use (eat food, equip gear).
- Drop/destroy.
- Future: bank/storage for overflow.

---

## 6. Equipment System

### 6.1 Slots

| Slot | Equipment Type |
|------|----------------|
| Weapon | Melee/ranged/magic weapon |
| Off-hand | Shield, book, etc. (optional) |
| Head | Helmet, hat |
| Body | Chest armor |
| Legs | Leg armor |
| Feet | Boots |
| Hands | Gloves |
| Cape | Cape (future) |
| Ammo | Arrows, runes (if applicable) |

### 6.2 Stat Requirements

- Each piece has level requirements (e.g. Attack 10, Defense 5).
- Cannot equip if stats too low.
- Equipment grants bonuses (e.g. +Attack, +Defense, +Strength).

### 6.3 Combat Style

- Weapon type determines combat style (melee, ranged, magic).
- Affects which combat stats are used (Attack/Strength, Ranged, Magic).

---

## 7. Data Structures (Reference)

### 7.1 Player State

```
player: {
  stats: {
    attack: { level: 1, xp: 0 },
    strength: { level: 1, xp: 0 },
    defense: { level: 1, xp: 0 },
    hitpoints: { level: 10, current: 10, xp: 0 },
    prayer: { level: 1, current: 0, xp: 0 },
    magic: { level: 1, xp: 0 },
    ranged: { level: 1, xp: 0 },
    cooking: { level: 1, xp: 0 },
    fishing: { level: 1, xp: 0 },
    mining: { level: 1, xp: 0 },
    smithing: { level: 1, xp: 0 },
    crafting: { level: 1, xp: 0 },
    hunting: { level: 1, xp: 0 },
    agility: { level: 1, xp: 0 },
  },
  inventory: [ /* array of { itemId, quantity } or empty slots */ ],
  equipment: { weapon: null, head: null, body: null, ... },
  hunger: 100,        // 0–100, only depletes during activity
  renown: 0,         // progression toward Noob → Legend
}
```

### 7.2 Item Definition (Example)

```
item: {
  id: "raw_chicken",
  name: "Raw chicken",
  type: "food",      // food | resource | equipment | tool
  stackable: true,
  maxStack: 999,
  equipSlot: null,
  stats: {},
  // for food: { hungerRestore: 5, cookResult: "cooked_chicken" }
}
```

### 7.3 Mob Definition (Example)

```
mob: {
  id: "chicken",
  name: "Chicken",
  hp: 3,
  attack: 0,
  strength: 0,
  defense: 0,
  lootTable: [
    { itemId: "raw_chicken", chance: 1, min: 1, max: 1 },
    { itemId: "feathers", chance: 0.5, min: 1, max: 5 },
  ],
  xp: { combat: 5, ... },
}
```

---

## 8. Prototype Scope (MVP)

### Phase 1: Foundation
- [ ] Stats data structure and display
- [ ] Inventory data structure and basic UI
- [ ] Equipment slots and basic equipping
- [ ] Item definitions for raw chicken, cooked chicken, bones

### Phase 2: Combat
- [ ] Basic combat flow (select target → fight → resolve)
- [ ] Accuracy, damage, defense, agility (evasion) formulas
- [ ] Chicken mob: killable, drops raw chicken
- [ ] XP gain for Attack, Strength, Defense, Hitpoints

### Phase 3: Food Loop
- [ ] Hunger stat (no passive decay)
- [ ] Cooking: raw chicken → cooked chicken at campfire
- [ ] Eating restores hunger
- [ ] Hunger consumed by combat (and optionally other activities)

### Phase 4: Polish
- [ ] Cow mob, raw beef, cooked beef
- [ ] UI feedback (damage numbers, loot popups)
- [ ] Sound effects (optional)

---

## 9. Notes

- Formulas are placeholders; tune during playtesting.
- Prayer and Magic can be stubbed (UI only) until spell/prayer systems are designed.
- Auto-fishing and auto meat collection are post-MVP.
