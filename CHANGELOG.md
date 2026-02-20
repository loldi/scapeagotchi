# Changelog

All notable changes to Scapeagotchi since the initial push.

---

## [Unreleased]

### New Features

#### Overworld Navigation
- Redesigned overworld map with connected locations: Castle → House → Mines (branch) → Coop
- Map replaces old card-based navigation with a visual path layout
- "Where to?" prompt for selecting destination
- Back button returns to previous location

#### New Areas

**Mines**
- Two cavern zones: Copper (left) and Tin (right)
- Dark cave atmosphere with stalactites, stalactites, and ore deposits
- Exit shaft returns to overworld map

**Castle**
- Castle courtyard with stone floor and walls
- Blacksmith area (forge + anvil)
- General store (shop stall)
- Exit archway to overworld map

#### New Shops

**General Store**
- Located at the castle shop stall
- Sells Bronze pickaxe (50 gp) — required for mining

**Forge**
- Located in the castle blacksmith
- Left-click to open smelting menu
- Smelt ores into bars: Bronze bar = 1 Copper ore + 1 Tin ore
- Options: Smelt ALL or Smelt X (with quantity input)

#### New Skilling Activities

**Mining (Copper & Tin)**
- Right-click in ore zones to open context menu
- Requires Bronze pickaxe
- Continuous mining: 1 ore every 2 seconds
- Switch ore type or leave area to stop
- Floating "+1 Copper ore" / "+1 Tin ore" feedback above player

**Smithing**
- *Smelting:* Use forge to turn copper + tin ore into bronze bars
- *Forging:* Use anvil to craft bronze gear from bars
  - Two-stage menu: select metal first (greyed out if no bars), then select item
  - Bronze dagger — 1 bar (Smithing 1)
  - Bronze cap — 1 bar (Smithing 1)
  - Bronze shorts — 2 bars (Smithing 1)
  - Bronze round shield — 2 bars (Smithing 1)

#### Save System
- Game state persists across sessions via localStorage
- Saves player stats, gold, inventory, equipment, and last scene
- Continue loads saved game; New Game starts fresh
- Auto-save on scene entry and tab close

#### UI Improvements
- Stats, Inventory, Equipment, and Map buttons visible in all scenes (House, Castle, Mines, Coop)
- "Menu" renamed to "Map" — opens overworld map directly
- Consistent right-click context menus across interactions
- Noobs House: door tooltip on hover instead of Leave button
