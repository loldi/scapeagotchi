/**
 * Mines area: two cavern zones - Copper (left) and Tin (right).
 * Right-click in a zone to mine. Bronze pickaxe required; 1 ore per 2 seconds.
 */

import { getPlayer } from '../state/gameState.js';
import { ITEMS } from '../data/items.js';
import { setupPlayerUI } from '../ui/playerPanels.js';
import { setCurrentScene, saveGame } from '../state/save.js';

export default class MinesScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MinesScene' });
  }

  create(data = {}) {
    setCurrentScene('MinesScene');
    saveGame();
    this.miningInProgress = false;
    this.miningTimer = null;
    this.currentMiningOre = null;

    const W = this.scale.width;
    const H = this.scale.height;
    this.minesW = W;
    this.minesH = H;
    const centerX = W / 2;
    const Y_TOP = 40;
    const Y_GROUND = 380;
    const Y_CAVE_CEIL = 120;

    // Zone bounds for right-click mining
    this.copperZone = { left: 0, right: 390, top: Y_CAVE_CEIL + 60, bottom: Y_GROUND + 50 };
    this.tinZone = { left: 410, right: W, top: Y_CAVE_CEIL + 50, bottom: Y_GROUND + 50 };

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

    // --- Background: dark cave ---
    const bg = this.add.container(0, 0);
    bg.setDepth(-100);

    // Overall cave darkness
    const caveG = this.add.graphics();
    caveG.fillStyle(0x1a1520, 1);
    caveG.fillRect(0, 0, W, H);
    bg.add(caveG);

    // --- Left cavern: Copper zone (brown/orange) ---
    const copperG = this.add.graphics();
    copperG.fillStyle(0x5d4a35, 1);
    copperG.fillRect(0, Y_CAVE_CEIL + 60, 390, Y_GROUND - Y_CAVE_CEIL - 40);
    copperG.fillEllipse(195, Y_GROUND - 80, 180, 100);
    copperG.lineStyle(2, 0x8b7355);
    copperG.strokeRect(0, Y_CAVE_CEIL + 60, 390, Y_GROUND - Y_CAVE_CEIL - 40);

    // Copper ore deposits (vivid brown/orange blobs)
    const copperOre = [0xb87333, 0xcd7f32, 0xd4a054, 0xa0522d];
    [[120, 280, 35, 25], [220, 320, 40, 30], [80, 350, 50, 20], [300, 290, 45, 35], [160, 380, 55, 22]].forEach(([x, y, w, h], i) => {
      copperG.fillStyle(copperOre[i % copperOre.length], 1);
      copperG.fillEllipse(x, y, w, h);
    });
    bg.add(copperG);

    // --- Right cavern: Tin zone (grey) ---
    const tinG = this.add.graphics();
    tinG.fillStyle(0x4a4a55, 1);
    tinG.fillRect(410, Y_CAVE_CEIL + 50, W - 410, Y_GROUND - Y_CAVE_CEIL - 30);
    tinG.fillEllipse(600, Y_GROUND - 70, 180, 95);
    tinG.lineStyle(2, 0x6a6a7a);
    tinG.strokeRect(410, Y_CAVE_CEIL + 50, W - 410, Y_GROUND - Y_CAVE_CEIL - 30);

    // Tin ore deposits (lighter grey blobs)
    const tinOre = [0x808090, 0x9090a0, 0x707080, 0xa0a0b0];
    [[480, 300, 40, 28], [560, 340, 45, 32], [640, 290, 38, 35], [520, 380, 50, 25], [700, 320, 42, 30]].forEach(([x, y, w, h], i) => {
      tinG.fillStyle(tinOre[i % tinOre.length], 1);
      tinG.fillEllipse(x, y, w, h);
    });
    bg.add(tinG);

    // --- Stalactites (hang from ceiling) ---
    const stalactiteG = this.add.graphics();
    const drawStalactite = (x, baseY, h, color) => {
      stalactiteG.fillStyle(color, 0.95);
      stalactiteG.fillTriangle(x - 6, baseY, x, baseY + h, x + 6, baseY);
    };
    // Copper zone stalactites (brown)
    [60, 140, 220, 300, 360].forEach((x, i) => drawStalactite(x, Y_CAVE_CEIL + 20 + i * 8, 50 + (i % 3) * 15, 0x9b7b5b));
    // Tin zone stalactites (grey)
    [450, 520, 600, 680, 750].forEach((x, i) => drawStalactite(x, Y_CAVE_CEIL + 30 + i * 6, 45 + (i % 2) * 18, 0x7a7a8a));
    bg.add(stalactiteG);

    // --- Stalagmites (rise from floor) ---
    const stalagmiteG = this.add.graphics();
    const drawStalagmite = (x, baseY, h, color) => {
      stalagmiteG.fillStyle(color, 0.95);
      stalagmiteG.fillTriangle(x - 5, baseY, x, baseY - h, x + 5, baseY);
    };
    // Copper zone stalagmites
    [100, 180, 260, 340].forEach((x, i) => drawStalagmite(x, Y_GROUND + 40, 35 + (i % 2) * 12, 0x8b7355));
    // Tin zone stalagmites
    [480, 560, 640, 720].forEach((x, i) => drawStalagmite(x, Y_GROUND + 35, 40 + (i % 3) * 10, 0x6a6a7a));
    bg.add(stalagmiteG);

    // --- Cave floor (unified dark stone) ---
    const floorG = this.add.graphics();
    floorG.fillStyle(0x3a3545, 1);
    floorG.fillRect(0, Y_GROUND, W, H - Y_GROUND);
    floorG.lineStyle(1, 0x5a5565);
    floorG.lineBetween(0, Y_GROUND, W, Y_GROUND);
    bg.add(floorG);

    // --- Exit (mine entrance / shaft back up) - left side ---
    const exitX = 60;
    const exitY = Y_GROUND - 140;
    const exitG = this.add.graphics();
    exitG.fillStyle(0x3a3530, 1);
    exitG.fillRect(exitX - 25, exitY - 120, 50, 140);
    exitG.lineStyle(2, 0x6b5344);
    exitG.strokeRect(exitX - 25, exitY - 120, 50, 140);
    exitG.fillStyle(0x2a2520, 1);
    exitG.fillRect(exitX - 18, exitY - 110, 36, 120);
    bg.add(exitG);

    const goToMap = () => {
      this.stopMining();
      this.tweens.killAll();
      this.time.delayedCall(50, () => {
        this.scene.start('OverworldMapScene', { from: 'MinesScene' });
      });
    };
    const exitHit = this.add.rectangle(exitX, exitY - 50, 50, 100);
    exitHit.setInteractive({ useHandCursor: true });
    exitHit.setDepth(100);
    exitHit.on('pointerdown', goToMap);
    this.add.existing(exitHit);

    const exitTooltip = txt(exitX, exitY + 50, 'Exit', 0xaaaadd, 8);
    exitTooltip.setOrigin(0.5);
    exitTooltip.setDepth(100);
    exitTooltip.setVisible(false);
    exitHit.on('pointerover', () => exitTooltip.setVisible(true));
    exitHit.on('pointerout', () => exitTooltip.setVisible(false));
    this.add.existing(exitTooltip);

    // --- Top bar: location ---
    const locBoxW = 140;
    const locBoxH = 36;
    const locBg = this.add.graphics();
    locBg.fillStyle(0x222244, 0.9);
    locBg.fillRoundedRect(centerX - locBoxW / 2, Y_TOP - 12, locBoxW, locBoxH, 8);
    locBg.lineStyle(1, 0x444466);
    locBg.strokeRoundedRect(centerX - locBoxW / 2, Y_TOP - 12, locBoxW, locBoxH, 8);
    locBg.setDepth(500);
    this.add.existing(locBg);
    this.locationLabel = txt(centerX, Y_TOP + 6, 'Mines', 0xccccdd, 10);
    this.locationLabel.setOrigin(0.5, 0.5);
    this.locationLabel.setDepth(500);
    this.add.existing(this.locationLabel);

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

    // --- Stats/Inventory/Equipment/Menu (always visible) ---
    setupPlayerUI(this, 'MinesScene');
    this.gameW = W;

    // --- Right-click context menu (same style as GameScene) ---
    this.contextMenuContainer = this.add.container(0, 0);
    this.contextMenuContainer.setVisible(false);
    this.contextMenuContainer.setDepth(1000);
    const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0);
    blocker.setInteractive({ useHandCursor: false });
    blocker.on('pointerdown', () => this.closeContextMenu());
    this.contextMenuContainer.add(blocker);
    this.contextMenuPanel = this.add.container(0, 0);
    this.contextMenuContainer.add(this.contextMenuPanel);

    const tryShowMineMenu = (gx, gy) => {
      let oreType = null;
      if (gx >= this.copperZone.left && gx <= this.copperZone.right && gy >= this.copperZone.top && gy <= this.copperZone.bottom) {
        oreType = 'copper_ore';
      } else if (gx >= this.tinZone.left && gx <= this.tinZone.right && gy >= this.tinZone.top && gy <= this.tinZone.bottom) {
        oreType = 'tin_ore';
      }
      if (oreType) this.showMineContextMenu(gx, gy, oreType);
    };
    this._wrapper = document.getElementById('game-wrapper') || (this.sys.game.canvas && this.sys.game.canvas.parentElement);
    if (this._wrapper) {
      this._contextMenuHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.scene.isActive('MinesScene')) return;
        const gameXY = this.screenToGame(e.clientX, e.clientY);
        if (gameXY) tryShowMineMenu(gameXY[0], gameXY[1]);
      };
      this._wrapper.addEventListener('contextmenu', this._contextMenuHandler, true);
    }
    this.input.on('pointerdown', (pointer, _lx, _ly, event) => {
      if (event && event.button === 2) tryShowMineMenu(pointer.x, pointer.y);
    });

    // --- Zone labels (subtle) ---
    const copperLabel = txt(200, Y_GROUND - 180, 'Copper', 0xb87333, 8);
    copperLabel.setDepth(50);
    this.add.existing(copperLabel);
    const tinLabel = txt(560, Y_GROUND - 180, 'Tin', 0x808080, 8);
    tinLabel.setDepth(50);
    this.add.existing(tinLabel);

    // --- Player character (center, on top of background) ---
    const Y_CHAR = Y_GROUND - 78;
    const scaperX = centerX;
    this.scaper = this.add.container(scaperX, Y_CHAR);
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

    // Idle animation
    this.tweens.add({
      targets: scaper,
      y: Y_CHAR - 5,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  showMineContextMenu(worldX, worldY, oreType) {
    this.closeContextMenu();
    const W = this.minesW;
    const H = this.minesH;
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
    const menuW = 160;
    const optionH = 34;
    const optionGap = 6;
    const label = oreType === 'copper_ore' ? 'Mine copper' : 'Mine tin';
    const options = [
      { label, action: () => { this.closeContextMenu(); this.tryStartMining(oreType); } },
      { label: 'Cancel', action: () => { this.closeContextMenu(); } }
    ];
    const menuH = options.length * (optionH + optionGap) + optionGap * 2;
    const panelX = Phaser.Math.Clamp(worldX, menuW / 2 + 8, W - menuW / 2 - 8);
    const panelY = Phaser.Math.Clamp(worldY + 8, 8, H - menuH - 8);
    this.contextMenuPanel.setPosition(panelX, panelY);
    this.contextMenuPanel.removeAll(true);
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.98);
    bg.fillRoundedRect(-menuW / 2, 0, menuW, menuH, 6);
    bg.lineStyle(1, 0x555588);
    bg.strokeRoundedRect(-menuW / 2, 0, menuW, menuH, 6);
    this.contextMenuPanel.add(bg);
    options.forEach((opt, i) => {
      const y = optionGap + optionH / 2 + i * (optionH + optionGap);
      const btnW = menuW - 20;
      const btnH = optionH;
      const box = this.add.graphics();
      const redraw = (hover = false) => {
        box.clear();
        box.fillStyle(hover ? 0x444466 : 0x333355, 0.95);
        box.fillRoundedRect(-btnW / 2, y - btnH / 2, btnW, btnH, 4);
        box.lineStyle(1, hover ? 0x8888cc : 0x6666aa);
        box.strokeRoundedRect(-btnW / 2, y - btnH / 2, btnW, btnH, 4);
      };
      redraw();
      const labelTxt = txt(0, y, opt.label, 0xeaeaea, 10).setOrigin(0.5);
      const hit = this.add.rectangle(0, y, btnW, btnH);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => redraw(true));
      hit.on('pointerout', () => redraw(false));
      hit.on('pointerdown', opt.action);
      this.contextMenuPanel.add([box, labelTxt, hit]);
    });
    this.contextMenuContainer.setVisible(true);
  }

  closeContextMenu() {
    if (this.contextMenuContainer) this.contextMenuContainer.setVisible(false);
  }

  screenToGame(clientX, clientY) {
    const canvas = this.sys.game.canvas;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    const relX = (clientX - bounds.left) / bounds.width;
    const relY = (clientY - bounds.top) / bounds.height;
    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return null;
    return [relX * this.minesW, relY * this.minesH];
  }

  tryStartMining(oreType) {
    const player = getPlayer();
    const hasPickaxe = player.inventory && player.inventory.some(s => s && s.itemId === 'bronze_pickaxe');
    if (!hasPickaxe) {
      this.stopMining();
      this.statusLabel.setText('Need pickaxe');
      this.time.delayedCall(2000, () => {
        if (this.statusLabel && !this.miningInProgress) this.statusLabel.setText('IDLE');
      });
      return;
    }
    if (this.miningTimer) this.miningTimer.remove();
    this.currentMiningOre = oreType;
    this.miningInProgress = true;
    this.statusLabel.setText('Mining...');
    this.scheduleNextOre(oreType);
  }

  stopMining() {
    if (this.miningTimer) {
      this.miningTimer.remove();
      this.miningTimer = null;
    }
    this.currentMiningOre = null;
    this.miningInProgress = false;
    if (this.statusLabel) this.statusLabel.setText('IDLE');
  }

  scheduleNextOre(oreType) {
    if (!this.scene.isActive('MinesScene') || this.currentMiningOre !== oreType) {
      this.stopMining();
      return;
    }
    this.miningTimer = this.time.delayedCall(2000, () => {
      this.miningTimer = null;
      if (!this.scene.isActive('MinesScene')) {
        this.stopMining();
        return;
      }
      if (this.currentMiningOre !== oreType) {
        this.stopMining();
        return;
      }
      const player = getPlayer();
      if (!player.inventory) player.inventory = [];
      const itemData = ITEMS[oreType];
      if (itemData && itemData.stackable) {
        const existing = player.inventory.find(s => s && s.itemId === oreType);
        if (existing) {
          existing.quantity = (existing.quantity || 1) + 1;
        } else if (player.inventory.length < 48) {
          player.inventory.push({ itemId: oreType, quantity: 1 });
        }
      } else if (player.inventory.length < 48) {
        player.inventory.push({ itemId: oreType, quantity: 1 });
      }
      this.showOreGainedFeedback(oreType);
      if (this.refreshInventoryDisplay) this.refreshInventoryDisplay();
      this.scheduleNextOre(oreType);
    });
  }

  showOreGainedFeedback(oreType) {
    const itemData = ITEMS[oreType];
    const name = itemData ? itemData.name : oreType;
    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const txt = (x, y, text, color) => {
      const t = this.add.text(x, y, text, {
        fontSize: '8px',
        fontFamily: '"Press Start 2P", monospace',
        color: hex(color)
      });
      t.setOrigin(0.5);
      t.setPadding(10, 6, 10, 6);
      return t;
    };
    const x = this.scaper ? this.scaper.x : this.minesW / 2;
    const y = this.scaper ? this.scaper.y - 90 : 280;
    const color = oreType === 'copper_ore' ? 0xb87333 : 0x808090;
    const notif = txt(x, y, `+1 ${name}`, color);
    notif.setDepth(300);
    this.tweens.add({
      targets: notif,
      y: notif.y - 25,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => notif.destroy()
    });
  }

  shutdown() {
    if (this._wrapper && this._contextMenuHandler) {
      this._wrapper.removeEventListener('contextmenu', this._contextMenuHandler, true);
    }
    this.stopMining();
    this.tweens.killAll();
  }
}
