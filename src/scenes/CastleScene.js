/**
 * Castle area: courtyard with shop stall and blacksmith (forge + anvil).
 */

import { getPlayer } from '../state/gameState.js';
import { ITEMS, SMELT_RECIPES, ANVIL_RECIPES } from '../data/items.js';
import { setupPlayerUI } from '../ui/playerPanels.js';
import { createItemIcon } from '../ui/createItemIcon.js';
import { setCurrentScene, saveGame } from '../state/save.js';

const SHOP_ITEMS = [
  { itemId: 'bronze_pickaxe', name: 'Bronze pickaxe', price: 50 }
];

export default class CastleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CastleScene' });
  }

  create(data = {}) {
    setCurrentScene('CastleScene');
    saveGame();
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;
    const Y_TOP = 40;
    const Y_GROUND = 380;
    const Y_CHAR = Y_GROUND - 78;

    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const txt = (x, y, text, color = 0xeaeaea, size = 10) => {
      const c = typeof color === 'number' ? hex(color) : color;
      const t = this.add.text(x, y, text, {
        fontSize: `${size}px`,
        fontFamily: '"Press Start 2P", monospace',
        color: c
      });
      t.setPadding(10, 6, 10, 6);
      return t;
    };

    const player = getPlayer();

    // --- Background: castle courtyard ---
    const bg = this.add.container(0, 0);
    bg.setDepth(-100);

    // Stone ground
    const floorG = this.add.graphics();
    floorG.fillStyle(0x6a6a7a, 1);
    floorG.fillRect(0, 0, W, H);
    floorG.fillStyle(0x5a5a6a, 0.6);
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 15; j++) {
        floorG.fillRect(i * 42 + (j % 2) * 21, j * 42, 38, 38);
      }
    }
    floorG.lineStyle(1, 0x4a4a5a);
    for (let i = 0; i <= 20; i++) floorG.lineBetween(i * 42, 0, i * 42, H);
    for (let j = 0; j <= 15; j++) floorG.lineBetween(0, j * 42, W, j * 42);
    bg.add(floorG);

    // Castle walls (rear)
    const wallG = this.add.graphics();
    wallG.fillStyle(0x888899, 1);
    wallG.fillRect(0, 0, W, 180);
    wallG.fillStyle(0x9999aa, 0.5);
    wallG.fillRect(0, 0, W, 80);
    wallG.lineStyle(2, 0x6a6a7a);
    for (let i = 0; i < 12; i++) {
      wallG.lineBetween(i * 70, 0, i * 70, 180);
    }
    bg.add(wallG);

    // --- Blacksmith (center-left): forge + anvil ---
    const blacksmithX = 280;
    const blacksmithY = Y_GROUND - 100;
    const blacksmithG = this.add.graphics();
    blacksmithG.fillStyle(0x4a4a5a, 1);
    blacksmithG.fillRect(blacksmithX - 90, blacksmithY - 80, 180, 120);
    blacksmithG.fillStyle(0x5a5a6a, 0.8);
    blacksmithG.fillRect(blacksmithX - 85, blacksmithY - 75, 170, 110);
    blacksmithG.lineStyle(2, 0x6a6a7a);
    blacksmithG.strokeRect(blacksmithX - 90, blacksmithY - 80, 180, 120);
    // Forge (left side - glowing hearth)
    blacksmithG.fillStyle(0x2a2020, 1);
    blacksmithG.fillRoundedRect(blacksmithX - 75, blacksmithY - 30, 70, 80, 8);
    blacksmithG.fillStyle(0xff4422, 0.9);
    blacksmithG.fillEllipse(blacksmithX - 40, blacksmithY + 5, 50, 35);
    blacksmithG.fillStyle(0xff8800, 0.7);
    blacksmithG.fillEllipse(blacksmithX - 40, blacksmithY + 10, 40, 25);
    blacksmithG.lineStyle(1, 0x8b4513);
    blacksmithG.strokeRoundedRect(blacksmithX - 75, blacksmithY - 30, 70, 80, 8);
    // Anvil (right side)
    blacksmithG.fillStyle(0x555566, 1);
    blacksmithG.fillRoundedRect(blacksmithX + 15, blacksmithY, 60, 30, 4);
    blacksmithG.fillStyle(0x444455, 1);
    blacksmithG.fillRect(blacksmithX + 20, blacksmithY + 25, 50, 25);
    blacksmithG.fillStyle(0x8b7355, 1);
    blacksmithG.fillRect(blacksmithX + 5, blacksmithY - 20, 80, 25);
    blacksmithG.lineStyle(1, 0x6a6a7a);
    blacksmithG.strokeRoundedRect(blacksmithX + 15, blacksmithY, 60, 30, 4);
    bg.add(blacksmithG);

    const forgeX = blacksmithX - 40;
    const forgeY = blacksmithY + 10;
    const forgeHit = this.add.rectangle(forgeX, forgeY, 70, 80);
    forgeHit.setInteractive({ useHandCursor: true });
    forgeHit.setDepth(50);
    forgeHit.on('pointerdown', () => this.openForgeMenu());
    this.add.existing(forgeHit);

    const forgeLabel = txt(forgeX, forgeY + 50, 'Forge', 0xcc6644, 8);
    forgeLabel.setOrigin(0.5);
    forgeLabel.setDepth(50);
    this.add.existing(forgeLabel);

    const anvilX = blacksmithX + 45;
    const anvilY = blacksmithY + 15;
    const anvilHit = this.add.rectangle(anvilX, anvilY, 80, 60);
    anvilHit.setInteractive({ useHandCursor: true });
    anvilHit.setDepth(50);
    anvilHit.on('pointerdown', () => this.openAnvilMenu());
    this.add.existing(anvilHit);

    const anvilLabel = txt(anvilX, anvilY + 40, 'Anvil', 0x888899, 8);
    anvilLabel.setOrigin(0.5);
    anvilLabel.setDepth(50);
    this.add.existing(anvilLabel);

    // Shop stall (right side)
    const stallX = W - 180;
    const stallY = Y_GROUND - 60;
    const stallG = this.add.graphics();
    stallG.fillStyle(0x6b5344, 1);
    stallG.fillRect(stallX - 70, stallY - 10, 140, 80);
    stallG.fillStyle(0x8b7355, 0.95);
    stallG.fillRect(stallX - 65, stallY - 5, 130, 70);
    stallG.fillStyle(0x4a3a2a, 1);
    stallG.fillRect(stallX - 55, stallY + 20, 110, 8);
    stallG.lineStyle(2, 0x5d4a3a);
    stallG.strokeRect(stallX - 70, stallY - 10, 140, 80);
    // Awning
    stallG.fillStyle(0x8b4513, 1);
    stallG.fillTriangle(stallX - 80, stallY - 10, stallX, stallY - 50, stallX + 80, stallY - 10);
    stallG.lineStyle(1, 0x5d3a1a);
    stallG.strokeTriangle(stallX - 80, stallY - 10, stallX, stallY - 50, stallX + 80, stallY - 10);
    // Pickaxe display (small icon on counter)
    stallG.fillStyle(0x8b7355, 1);
    stallG.fillRect(stallX - 8, stallY - 15, 16, 4);
    stallG.fillStyle(0xcd7f32, 1);
    stallG.fillRect(stallX - 6, stallY - 25, 4, 20);
    stallG.fillRect(stallX + 2, stallY - 25, 4, 20);
    stallG.fillStyle(0x6b5344, 1);
    stallG.fillRect(stallX - 12, stallY - 35, 24, 8);
    bg.add(stallG);

    // Stall hit area - click to open shop
    const stallHit = this.add.rectangle(stallX, stallY + 20, 140, 90);
    stallHit.setInteractive({ useHandCursor: true });
    stallHit.setDepth(50);
    stallHit.on('pointerdown', () => this.openShopMenu());
    this.add.existing(stallHit);

    const stallLabel = txt(stallX, stallY + 60, 'Shop', 0xaaaadd, 8);
    stallLabel.setOrigin(0.5);
    stallLabel.setDepth(50);
    this.add.existing(stallLabel);

    // Exit (archway left)
    const exitX = 80;
    const exitY = Y_GROUND - 100;
    const exitG = this.add.graphics();
    exitG.fillStyle(0x4a3a3a, 1);
    exitG.fillRect(exitX - 35, exitY - 100, 70, 120);
    exitG.fillStyle(0x2a2520, 1);
    exitG.fillRect(exitX - 25, exitY - 90, 50, 100);
    exitG.lineStyle(2, 0x5d4a4a);
    exitG.strokeRect(exitX - 35, exitY - 100, 70, 120);
    bg.add(exitG);

    const goToMap = () => {
      this.closeShopMenu();
      this.closeForgeMenu();
      this.closeAnvilMenu();
      this.tweens.killAll();
      this.time.delayedCall(50, () => {
        this.scene.start('OverworldMapScene', { from: 'CastleScene' });
      });
    };
    const exitHit = this.add.rectangle(exitX, exitY - 40, 70, 120);
    exitHit.setInteractive({ useHandCursor: true });
    exitHit.setDepth(100);
    exitHit.on('pointerdown', goToMap);
    this.add.existing(exitHit);

    const exitTooltip = txt(exitX, exitY + 35, 'Exit', 0xaaaadd, 8);
    exitTooltip.setOrigin(0.5);
    exitTooltip.setDepth(100);
    exitTooltip.setVisible(false);
    exitHit.on('pointerover', () => exitTooltip.setVisible(true));
    exitHit.on('pointerout', () => exitTooltip.setVisible(false));
    this.add.existing(exitTooltip);

    // --- Top bar ---
    const locBoxW = 140;
    const locBg = this.add.graphics();
    locBg.fillStyle(0x222244, 0.9);
    locBg.fillRoundedRect(centerX - locBoxW / 2, Y_TOP - 12, locBoxW, 36, 8);
    locBg.lineStyle(1, 0x444466);
    locBg.strokeRoundedRect(centerX - locBoxW / 2, Y_TOP - 12, locBoxW, 36, 8);
    locBg.setDepth(500);
    this.add.existing(locBg);
    this.locationLabel = txt(centerX, Y_TOP + 6, 'Castle', 0xccccdd, 10);
    this.locationLabel.setOrigin(0.5, 0.5);
    this.locationLabel.setDepth(500);
    this.add.existing(this.locationLabel);

    this.goldLabel = txt(W - 170, Y_TOP + 6, `${player.gold || 0} gp`, 0xffdd88, 8);
    this.goldLabel.setOrigin(0.5, 0.5);
    this.goldLabel.setDepth(500);
    this.add.existing(this.goldLabel);

    const statusBg = this.add.graphics();
    statusBg.fillStyle(0x222244, 0.9);
    statusBg.fillRoundedRect(W - 130, Y_TOP - 12, 100, 36, 8);
    statusBg.lineStyle(1, 0x444466);
    statusBg.strokeRoundedRect(W - 130, Y_TOP - 12, 100, 36, 8);
    statusBg.setDepth(500);
    this.add.existing(statusBg);
    this.statusLabel = txt(W - 80, Y_TOP + 6, 'IDLE', 0xaaaacc, 8);
    this.statusLabel.setOrigin(0.5, 0.5);
    this.statusLabel.setDepth(500);
    this.add.existing(this.statusLabel);

    setupPlayerUI(this, 'CastleScene');
    this.gameW = W;

    // --- Player character ---
    this.scaper = this.add.container(centerX, Y_CHAR);
    this.scaper.setDepth(200);
    const scaper = this.scaper;
    const skin = 0xffddbb;
    const shirt = 0x558855;
    const pants = 0xccaa88;
    const g = this.add.graphics();
    g.fillStyle(skin, 1);
    g.fillCircle(0, -22, 14);
    g.lineStyle(1, 0x886644);
    g.strokeCircle(0, -22, 14);
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(-12, -6, 24, 28, 4);
    g.lineStyle(1, 0x336633);
    g.strokeRoundedRect(-12, -6, 24, 28, 4);
    g.lineStyle(3, skin);
    g.lineBetween(-14, 0, -26, 8);
    g.lineBetween(14, 0, 26, 8);
    g.lineStyle(3, pants);
    g.lineBetween(-6, 22, -8, 42);
    g.lineBetween(6, 22, 8, 42);
    scaper.add(g);
    scaper.setScale(3);

    this.tweens.add({
      targets: scaper,
      y: Y_CHAR - 5,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  openShopMenu() {
    if (this.shopPanel && this.shopPanel.visible) return;
    this.closeShopMenu();
    this.closeForgeMenu();
    this.closeAnvilMenu();
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;

    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const txt = (x, y, text, color = 0xeaeaea, size = 10) => {
      const c = typeof color === 'number' ? hex(color) : color;
      const t = this.add.text(x, y, text, {
        fontSize: `${size}px`,
        fontFamily: '"Press Start 2P", monospace',
        color: c
      });
      t.setOrigin(0.5);
      t.setPadding(10, 6, 10, 6);
      return t;
    };

    const player = getPlayer();
    const gold = player.gold || 0;

    const panelW = 320;
    const panelH = 220;
    const panelX = centerX;
    const panelY = H / 2;

    this.shopPanel = this.add.container(0, 0);
    this.shopPanel.setDepth(900);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2a, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panelBg.lineStyle(2, 0x444466);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    this.shopPanel.add(panelBg);

    this.shopPanel.add(txt(panelX, panelY - 90, 'Shop', 0xffffff, 12));
    this.shopPanel.add(txt(panelX, panelY - 65, `Gold: ${gold} gp`, 0xffdd88, 8));

    SHOP_ITEMS.forEach((item, i) => {
      const itemData = ITEMS[item.itemId];
      const name = itemData ? itemData.name : item.name;
      const price = item.price;
      const y = panelY - 25 + i * 50;
      this.shopPanel.add(txt(panelX - 80, y, name, 0xccccdd, 8).setOrigin(0, 0.5));
      this.shopPanel.add(txt(panelX - 80, y + 18, `${price} gp`, 0xffdd88, 6).setOrigin(0, 0.5));

      const canAfford = gold >= price;
      const hasPickaxe = player.inventory && player.inventory.some(s => s && s.itemId === 'bronze_pickaxe');
      const disabled = !canAfford || (item.itemId === 'bronze_pickaxe' && hasPickaxe);

      const btnW = 80;
      const btnH = 28;
      const btnX = panelX + 70;
      const btnBg = this.add.graphics();
      const drawBtn = (hover = false) => {
        btnBg.clear();
        btnBg.fillStyle(disabled ? 0x333344 : (hover ? 0x555566 : 0x444455), 0.95);
        btnBg.fillRoundedRect(btnX - btnW / 2, y - btnH / 2, btnW, btnH, 4);
        btnBg.lineStyle(1, disabled ? 0x444455 : 0x666677);
        btnBg.strokeRoundedRect(btnX - btnW / 2, y - btnH / 2, btnW, btnH, 4);
      };
      drawBtn();
      this.shopPanel.add(btnBg);

      const btnLabel = disabled
        ? (hasPickaxe ? 'Owned' : 'Need gold')
        : 'Buy';
      const btnTxt = txt(btnX, y, btnLabel, disabled ? 0x666677 : 0xaaaadd, 6);
      this.shopPanel.add(btnTxt);

      const btnHit = this.add.rectangle(btnX, y, btnW, btnH);
      btnHit.setInteractive({ useHandCursor: !disabled });
      if (!disabled) {
        btnHit.on('pointerdown', () => {
          player.gold = (player.gold || 0) - price;
          if (!player.inventory) player.inventory = [];
          player.inventory.push({ itemId: item.itemId, quantity: 1 });
          this.closeShopMenu();
          this.openShopMenu(); // Refresh
        });
        btnHit.on('pointerover', () => drawBtn(true));
        btnHit.on('pointerout', () => drawBtn(false));
      }
      this.shopPanel.add(btnHit);
    });

    const closeY = panelY + 75;
    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0x333355, 0.9);
    closeBtn.fillRoundedRect(centerX - 50, closeY - 14, 100, 28, 4);
    closeBtn.lineStyle(1, 0x555588);
    closeBtn.strokeRoundedRect(centerX - 50, closeY - 14, 100, 28, 4);
    this.shopPanel.add(closeBtn);
    this.shopPanel.add(txt(centerX, closeY, 'Close', 0xaaaadd, 8));
    const closeHit = this.add.rectangle(centerX, closeY, 100, 28);
    closeHit.setInteractive({ useHandCursor: true });
    closeHit.on('pointerdown', () => this.closeShopMenu());
    this.shopPanel.add(closeHit);

    this.add.existing(this.shopPanel);
    if (this.goldLabel) this.goldLabel.setText(`${player.gold || 0} gp`);
  }

  closeShopMenu() {
    if (this.shopPanel) {
      this.shopPanel.destroy();
      this.shopPanel = null;
    }
    const player = getPlayer();
    if (this.goldLabel) this.goldLabel.setText(`${player.gold || 0} gp`);
  }

  /** Count how many of a bar type the player can smelt with current ores */
  countMaxSmeltable(barId) {
    const recipe = SMELT_RECIPES[barId];
    if (!recipe) return 0;
    const player = getPlayer();
    const inv = player.inventory || [];
    let min = Infinity;
    for (const { itemId, amount } of recipe.ores) {
      const slot = inv.find(s => s && s.itemId === itemId);
      const have = slot ? (slot.quantity || 1) : 0;
      min = Math.min(min, Math.floor(have / amount));
    }
    return min === Infinity ? 0 : min;
  }

  openForgeMenu() {
    if (this.forgePanel && this.forgePanel.visible) return;
    this.closeForgeMenu();
    this.closeAnvilMenu();
    this.closeShopMenu();
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;

    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const txt = (x, y, text, color = 0xeaeaea, size = 10) => {
      const c = typeof color === 'number' ? hex(color) : color;
      const t = this.add.text(x, y, text, {
        fontSize: `${size}px`,
        fontFamily: '"Press Start 2P", monospace',
        color: c
      });
      t.setOrigin(0.5);
      t.setPadding(10, 6, 10, 6);
      return t;
    };

    const panelW = 300;
    const panelH = 280;
    const panelX = centerX;
    const panelY = H / 2;

    this.forgePanel = this.add.container(0, 0);
    this.forgePanel.setDepth(900);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2a, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panelBg.lineStyle(2, 0x444466);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    this.forgePanel.add(panelBg);

    this.forgePanel.add(txt(panelX, panelY - 120, 'Smelt bars', 0xffffff, 12));

    const barTypes = Object.keys(SMELT_RECIPES);
    if (!this.forgeSelectedBarId || !barTypes.includes(this.forgeSelectedBarId)) {
      this.forgeSelectedBarId = barTypes[0] || null;
    }
    const selectedBarId = this.forgeSelectedBarId;
    const maxSmeltable = selectedBarId ? this.countMaxSmeltable(selectedBarId) : 0;

    barTypes.forEach((barId, i) => {
      const itemData = ITEMS[barId];
      const name = itemData ? itemData.name : barId;
      const recipe = SMELT_RECIPES[barId];
      const reqStr = recipe.ores.map(o => `${o.amount} ${ITEMS[o.itemId]?.name || o.itemId}`).join(' + ');
      const max = this.countMaxSmeltable(barId);
      const y = panelY - 80 + i * 36;
      const isSelected = barId === selectedBarId;
      const rowBg = this.add.graphics();
      rowBg.fillStyle(isSelected ? 0x444466 : 0x2a2a3a, 0.9);
      rowBg.fillRoundedRect(panelX - panelW / 2 + 12, y - 14, panelW - 24, 28, 4);
      this.forgePanel.add(rowBg);
      this.forgePanel.add(txt(panelX - 90, y, name, 0xccccdd, 8).setOrigin(0, 0.5));
      this.forgePanel.add(txt(panelX - 90, y + 12, `(${reqStr})`, 0x8888aa, 6).setOrigin(0, 0.5));
      this.forgePanel.add(txt(panelX + 60, y, max > 0 ? `x${max}` : '-', max > 0 ? 0xaaffaa : 0x666677, 8));
      const rowHit = this.add.rectangle(panelX, y, panelW - 24, 28);
      rowHit.setInteractive({ useHandCursor: true });
      rowHit.on('pointerdown', () => {
        this.forgeSelectedBarId = barId;
        this.closeForgeMenu();
        this.openForgeMenu();
      });
      this.forgePanel.add(rowHit);
    });

    const sepY = panelY + 20;
    this.forgePanel.add(this.add.graphics().lineStyle(1, 0x444466).lineBetween(panelX - panelW / 2 + 16, sepY, panelX + panelW / 2 - 16, sepY));

    const smeltAllY = panelY + 55;
    const smeltXY = panelY + 95;

    const smeltAllBtn = this.add.graphics();
    smeltAllBtn.fillStyle(0x444455, 0.95);
    smeltAllBtn.fillRoundedRect(panelX - 70, smeltAllY - 16, 140, 32, 4);
    smeltAllBtn.lineStyle(1, 0x666688);
    smeltAllBtn.strokeRoundedRect(panelX - 70, smeltAllY - 16, 140, 32, 4);
    this.forgePanel.add(smeltAllBtn);
    this.forgePanel.add(txt(panelX, smeltAllY, 'Smelt ALL', 0xaaaadd, 8));
    const smeltAllHit = this.add.rectangle(panelX, smeltAllY, 140, 32);
    smeltAllHit.setInteractive({ useHandCursor: maxSmeltable > 0 });
    smeltAllHit.on('pointerdown', () => {
      if (maxSmeltable > 0 && selectedBarId) this.doSmelt(selectedBarId, maxSmeltable);
    });
    if (maxSmeltable > 0) {
      smeltAllHit.on('pointerover', () => { smeltAllBtn.clear(); smeltAllBtn.fillStyle(0x555566, 0.95); smeltAllBtn.fillRoundedRect(panelX - 70, smeltAllY - 16, 140, 32, 4); smeltAllBtn.lineStyle(1, 0x777799); smeltAllBtn.strokeRoundedRect(panelX - 70, smeltAllY - 16, 140, 32, 4); });
      smeltAllHit.on('pointerout', () => { smeltAllBtn.clear(); smeltAllBtn.fillStyle(0x444455, 0.95); smeltAllBtn.fillRoundedRect(panelX - 70, smeltAllY - 16, 140, 32, 4); smeltAllBtn.lineStyle(1, 0x666688); smeltAllBtn.strokeRoundedRect(panelX - 70, smeltAllY - 16, 140, 32, 4); });
    }
    this.forgePanel.add(smeltAllHit);

    this.forgePanel.add(txt(panelX - 80, smeltXY - 8, 'Smelt', 0xaaaacc, 8).setOrigin(0, 0.5));
    const inputW = 60;
    const inputH = 28;
    const inputX = panelX - 20;
    const inputY = smeltXY;
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x333355, 0.95);
    inputBg.fillRoundedRect(inputX - inputW / 2, inputY - inputH / 2, inputW, inputH, 4);
    inputBg.lineStyle(1, 0x555588);
    inputBg.strokeRoundedRect(inputX - inputW / 2, inputY - inputH / 2, inputW, inputH, 4);
    this.forgePanel.add(inputBg);

    const canvas = this.sys.game.canvas;
    const canvasRect = canvas ? canvas.getBoundingClientRect() : { left: 0, top: 0, width: W, height: H };
    const scaleX = canvasRect.width / W;
    const scaleY = canvasRect.height / H;
    const inputEl = document.createElement('input');
    inputEl.type = 'number';
    inputEl.min = '1';
    inputEl.max = String(Math.max(1, maxSmeltable));
    inputEl.value = maxSmeltable > 0 ? '1' : '0';
    inputEl.placeholder = '0';
    inputEl.style.cssText = `
      position: fixed;
      left: ${canvasRect.left + (inputX - inputW / 2 + 10) * scaleX}px;
      top: ${canvasRect.top + (inputY - inputH / 2 + 6) * scaleY}px;
      width: ${Math.max(40, (inputW - 20) * scaleX)}px;
      height: ${Math.max(20, (inputH - 12) * scaleY)}px;
      font-family: "Press Start 2P", monospace;
      font-size: 10px;
      background: #1a1a2e;
      color: #eaeaea;
      border: 1px solid #555588;
      padding: 4px;
      z-index: 10000;
    `;
    document.body.appendChild(inputEl);
    this._forgeInputEl = inputEl;

    const smeltXBtn = this.add.graphics();
    smeltXBtn.fillStyle(0x444455, 0.95);
    smeltXBtn.fillRoundedRect(panelX + 50, smeltXY - 16, 70, 32, 4);
    smeltXBtn.lineStyle(1, 0x666688);
    smeltXBtn.strokeRoundedRect(panelX + 50, smeltXY - 16, 70, 32, 4);
    this.forgePanel.add(smeltXBtn);
    this.forgePanel.add(txt(panelX + 85, smeltXY, 'Smelt', 0xaaaadd, 6));
    const smeltXHit = this.add.rectangle(panelX + 85, smeltXY, 70, 32);
    smeltXHit.setInteractive({ useHandCursor: maxSmeltable > 0 });
    smeltXHit.on('pointerdown', () => {
      const n = Math.max(0, Math.min(maxSmeltable, parseInt(inputEl.value, 10) || 0));
      if (n > 0 && selectedBarId) this.doSmelt(selectedBarId, n);
    });
    this.forgePanel.add(smeltXHit);

    const closeY = panelY + 130;
    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0x333355, 0.9);
    closeBtn.fillRoundedRect(centerX - 50, closeY - 14, 100, 28, 4);
    closeBtn.lineStyle(1, 0x555588);
    closeBtn.strokeRoundedRect(centerX - 50, closeY - 14, 100, 28, 4);
    this.forgePanel.add(closeBtn);
    this.forgePanel.add(txt(centerX, closeY, 'Close', 0xaaaadd, 8));
    const closeHit = this.add.rectangle(centerX, closeY, 100, 28);
    closeHit.setInteractive({ useHandCursor: true });
    closeHit.on('pointerdown', () => this.closeForgeMenu());
    this.forgePanel.add(closeHit);

    this.add.existing(this.forgePanel);
  }

  doSmelt(barId, amount) {
    const recipe = SMELT_RECIPES[barId];
    if (!recipe || amount <= 0) return;
    const player = getPlayer();
    const inv = player.inventory || [];
    const max = this.countMaxSmeltable(barId);
    const toSmelt = Math.min(amount, max);
    if (toSmelt <= 0) return;
    for (const { itemId, amount: amt } of recipe.ores) {
      const need = amt * toSmelt;
      let remaining = need;
      for (const slot of inv) {
        if (!slot || slot.itemId !== itemId) continue;
        const take = Math.min(remaining, slot.quantity || 1);
        slot.quantity = (slot.quantity || 1) - take;
        remaining -= take;
        if (slot.quantity <= 0) slot.quantity = 0;
        if (remaining <= 0) break;
      }
    }
    const barSlot = inv.find(s => s && s.itemId === barId);
    const barQty = toSmelt * (recipe.barAmount || 1);
    if (barSlot) {
      barSlot.quantity = (barSlot.quantity || 1) + barQty;
    } else if (inv.length < 48) {
      inv.push({ itemId: barId, quantity: barQty });
    }
    player.inventory = inv.filter(s => s && (s.quantity || 0) > 0);
    this.closeForgeMenu();
    if (this.refreshInventoryDisplay) this.refreshInventoryDisplay();
  }

  closeForgeMenu() {
    if (this._forgeInputEl && this._forgeInputEl.parentNode) {
      this._forgeInputEl.parentNode.removeChild(this._forgeInputEl);
      this._forgeInputEl = null;
    }
    if (this.forgePanel) {
      this.forgePanel.destroy();
      this.forgePanel = null;
    }
  }

  countBars(barId) {
    const player = getPlayer();
    const slot = (player.inventory || []).find(s => s && s.itemId === barId);
    return slot ? (slot.quantity || 1) : 0;
  }

  getSmithingLevel() {
    const player = getPlayer();
    const s = player.stats?.smithing;
    return s ? (s.level || 1) : 1;
  }

  openAnvilMenu() {
    if (this.anvilPanel && this.anvilPanel.visible) return;
    this.closeAnvilMenu();
    this.closeForgeMenu();
    this.closeShopMenu();
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;

    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const txt = (x, y, text, color = 0xeaeaea, size = 10) => {
      const c = typeof color === 'number' ? hex(color) : color;
      const t = this.add.text(x, y, text, {
        fontSize: `${size}px`,
        fontFamily: '"Press Start 2P", monospace',
        color: c
      });
      t.setOrigin(0.5);
      t.setPadding(10, 6, 10, 6);
      return t;
    };

    const panelW = 280;
    const panelH = 180;
    const panelX = centerX;
    const panelY = H / 2;

    this.anvilPanel = this.add.container(0, 0);
    this.anvilPanel.setDepth(900);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2a, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panelBg.lineStyle(2, 0x444466);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    this.anvilPanel.add(panelBg);

    this.anvilPanel.add(txt(panelX, panelY - 70, 'Choose metal', 0xffffff, 12));

    const metalDisplayNames = { bronze_bar: 'Bronze' };
    const metals = Object.keys(ANVIL_RECIPES);
    metals.forEach((barId, i) => {
      const have = this.countBars(barId);
      const name = metalDisplayNames[barId] || (ITEMS[barId]?.name || barId);
      const y = panelY - 30 + i * 44;
      const hasBars = have > 0;
      const rowBg = this.add.graphics();
      rowBg.fillStyle(hasBars ? 0x2a2a3a : 0x1a1a25, 0.9);
      rowBg.fillRoundedRect(panelX - panelW / 2 + 16, y - 16, panelW - 32, 36, 4);
      rowBg.lineStyle(1, hasBars ? 0x555588 : 0x333344);
      rowBg.strokeRoundedRect(panelX - panelW / 2 + 16, y - 16, panelW - 32, 36, 4);
      this.anvilPanel.add(rowBg);
      const metalIcon = createItemIcon(this, barId);
      metalIcon.setPosition(panelX - 100, y);
      metalIcon.setScale(2);
      this.anvilPanel.add(metalIcon);
      this.anvilPanel.add(txt(panelX, y, name, hasBars ? 0xccccdd : 0x666677, 8));
      this.anvilPanel.add(txt(panelX + 90, y, `x${have}`, hasBars ? 0xaaffaa : 0x555566, 8));
      const rowHit = this.add.rectangle(panelX, y, panelW - 32, 36);
      rowHit.setInteractive({ useHandCursor: hasBars });
      rowHit.on('pointerdown', () => {
        if (hasBars) {
          this.closeAnvilMenu();
          this.openAnvilItemMenu(barId);
        }
      });
      this.anvilPanel.add(rowHit);
    });

    const closeY = panelY + 55;
    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0x333355, 0.9);
    closeBtn.fillRoundedRect(centerX - 50, closeY - 14, 100, 28, 4);
    closeBtn.lineStyle(1, 0x555588);
    closeBtn.strokeRoundedRect(centerX - 50, closeY - 14, 100, 28, 4);
    this.anvilPanel.add(closeBtn);
    this.anvilPanel.add(txt(centerX, closeY, 'Close', 0xaaaadd, 8));
    const closeHit = this.add.rectangle(centerX, closeY, 100, 28);
    closeHit.setInteractive({ useHandCursor: true });
    closeHit.on('pointerdown', () => this.closeAnvilMenu());
    this.anvilPanel.add(closeHit);

    this.add.existing(this.anvilPanel);
  }

  openAnvilItemMenu(barId) {
    if (this.anvilPanel && this.anvilPanel.visible) return;
    this.closeAnvilMenu();
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;

    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const txt = (x, y, text, color = 0xeaeaea, size = 10) => {
      const c = typeof color === 'number' ? hex(color) : color;
      const t = this.add.text(x, y, text, {
        fontSize: `${size}px`,
        fontFamily: '"Press Start 2P", monospace',
        color: c
      });
      t.setOrigin(0.5);
      t.setPadding(10, 6, 10, 6);
      return t;
    };

    const recipes = ANVIL_RECIPES[barId] || [];
    const smithingLevel = this.getSmithingLevel();
    const barCount = this.countBars(barId);

    const panelW = 420;
    const panelH = 340;
    const panelX = centerX;
    const panelY = H / 2;

    this.anvilPanel = this.add.container(0, 0);
    this.anvilPanel.setDepth(900);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x1a1a2a, 0.98);
    panelBg.fillRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    panelBg.lineStyle(2, 0x444466);
    panelBg.strokeRoundedRect(panelX - panelW / 2, panelY - panelH / 2, panelW, panelH, 8);
    this.anvilPanel.add(panelBg);

    const metalDisplayNames = { bronze_bar: 'Bronze' };
    const metalName = metalDisplayNames[barId] || (ITEMS[barId]?.name || barId);
    this.anvilPanel.add(txt(panelX, panelY - 150, `${metalName} items`, 0xffffff, 12));

    const slotSize = 88;
    const cols = 2;
    const rows = 2;
    const gap = 16;
    const gridW = cols * slotSize + (cols - 1) * gap;
    const gridH = rows * slotSize + (rows - 1) * gap;
    const startX = panelX - gridW / 2 + slotSize / 2 + gap / 2;
    const startY = panelY - 90 + slotSize / 2;

    recipes.forEach((rec, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (slotSize + gap);
      const y = startY + row * (slotSize + gap);

      const canMake = barCount >= rec.bars && smithingLevel >= rec.smithingLevel;
      const slotBg = this.add.graphics();
      slotBg.fillStyle(canMake ? 0x333355 : 0x222233, 0.95);
      slotBg.fillRoundedRect(x - slotSize / 2 - 8, y - slotSize / 2 - 8, slotSize + 16, slotSize + 48, 6);
      slotBg.lineStyle(1, canMake ? 0x555588 : 0x333344);
      slotBg.strokeRoundedRect(x - slotSize / 2 - 8, y - slotSize / 2 - 8, slotSize + 16, slotSize + 48, 6);
      this.anvilPanel.add(slotBg);

      const icon = createItemIcon(this, rec.itemId);
      icon.setPosition(x, y - 10);
      icon.setScale(2.5);
      this.anvilPanel.add(icon);

      const itemData = ITEMS[rec.itemId];
      const itemName = itemData ? itemData.name : rec.itemId;
      this.anvilPanel.add(txt(x, y + slotSize / 2 + 4, itemName, canMake ? 0xccccdd : 0x666677, 8).setWordWrapWidth(slotSize - 4));
      this.anvilPanel.add(txt(x, y + slotSize / 2 + 20, `${rec.bars} bar(s)`, canMake ? 0xaaccaa : 0x555566, 6));

      const slotHit = this.add.rectangle(x, y, slotSize + 16, slotSize + 48);
      slotHit.setInteractive({ useHandCursor: canMake });
      slotHit.on('pointerdown', () => {
        if (canMake) this.doForge(rec.itemId, barId, rec.bars);
      });
      this.anvilPanel.add(slotHit);
    });

    const backY = panelY + 115;
    const backBtn = this.add.graphics();
    backBtn.fillStyle(0x333355, 0.9);
    backBtn.fillRoundedRect(panelX - 60, backY - 14, 80, 28, 4);
    backBtn.lineStyle(1, 0x555588);
    backBtn.strokeRoundedRect(panelX - 60, backY - 14, 80, 28, 4);
    this.anvilPanel.add(backBtn);
    this.anvilPanel.add(txt(panelX - 20, backY, 'Back', 0xaaaadd, 8));
    const backHit = this.add.rectangle(panelX - 20, backY, 80, 28);
    backHit.setInteractive({ useHandCursor: true });
    backHit.on('pointerdown', () => {
      this.closeAnvilMenu();
      this.openAnvilMenu();
    });
    this.anvilPanel.add(backHit);

    const closeY = panelY + 115;
    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0x333355, 0.9);
    closeBtn.fillRoundedRect(panelX + 40, closeY - 14, 80, 28, 4);
    closeBtn.lineStyle(1, 0x555588);
    closeBtn.strokeRoundedRect(panelX + 40, closeY - 14, 80, 28, 4);
    this.anvilPanel.add(closeBtn);
    this.anvilPanel.add(txt(panelX + 80, closeY, 'Close', 0xaaaadd, 8));
    const closeHit = this.add.rectangle(panelX + 80, closeY, 80, 28);
    closeHit.setInteractive({ useHandCursor: true });
    closeHit.on('pointerdown', () => this.closeAnvilMenu());
    this.anvilPanel.add(closeHit);

    this.add.existing(this.anvilPanel);
  }

  doForge(itemId, barId, barCost) {
    const player = getPlayer();
    const inv = player.inventory || [];
    const barSlot = inv.find(s => s && s.itemId === barId);
    if (!barSlot || (barSlot.quantity || 1) < barCost) return;
    barSlot.quantity = (barSlot.quantity || 1) - barCost;
    if (barSlot.quantity <= 0) {
      const idx = inv.indexOf(barSlot);
      inv.splice(idx, 1);
    }
    if (inv.length < 48) {
      inv.push({ itemId, quantity: 1 });
    }
    player.inventory = inv.filter(s => s && (s.quantity || 0) > 0);
    this.closeAnvilMenu();
    if (this.statusLabel) this.statusLabel.setText('Forged!');
    this.time.delayedCall(1500, () => { if (this.statusLabel) this.statusLabel.setText('IDLE'); });
    if (this.refreshInventoryDisplay) this.refreshInventoryDisplay();
  }

  closeAnvilMenu() {
    if (this.anvilPanel) {
      this.anvilPanel.destroy();
      this.anvilPanel = null;
    }
  }

  shutdown() {
    this.closeShopMenu();
    this.closeForgeMenu();
    this.closeAnvilMenu();
    this.tweens.killAll();
  }
}
