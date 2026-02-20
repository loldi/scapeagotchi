/**
 * Main game scene. Character interaction UI with separate Stats/Inventory/Equipment menus.
 */

import { getPlayer } from '../state/gameState.js';
import { setCurrentScene, saveGame } from '../state/save.js';
import { CombatState } from '../combat/combatEngine.js';
import { getWeapon } from '../data/weapons.js';
import { getNpc } from '../data/npcs.js';
import { ITEMS } from '../data/items.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  /** Phaser Text with setPadding to avoid BitmapText cropping (Press Start 2P). */
  makeText(x, y, text, color = 0xeaeaea, size = 10) {
    const hex = (n) => '#' + n.toString(16).padStart(6, '0');
    const c = typeof color === 'number' ? hex(color) : color;
    const t = this.add.text(x, y, text, {
      fontSize: `${size}px`,
      fontFamily: '"Press Start 2P", monospace',
      color: c
    });
    t.setPadding(10, 6, 10, 6);
    return t;
  }

  create() {
    setCurrentScene('GameScene');
    saveGame();
    this.chicken = null;
    this.chickenIdleTween = null;
    this.chickenWanderTween = null;
    this.combatState = null;
    this.combatNpc = null;

    const player = getPlayer();
    const W = this.scale.width;
    const H = this.scale.height;
    this.gameW = W;
    this.gameH = H;
    const centerX = W / 2;

    // Right-click: two paths so menu always works
    const tryShowChickenMenu = (gx, gy) => {
      if (this.chicken && this.hitTestChicken(gx, gy)) this.showNpcContextMenu(gx, gy, 'chicken');
      else this.showNpcContextMenu(gx, gy, null); // show Cancel-only menu so we know right-click fired
    };
    // 1) Native contextmenu on wrapper (most reliable) — store refs for cleanup on shutdown
    this._wrapper = document.getElementById('game-wrapper') || (this.sys.game.canvas && this.sys.game.canvas.parentElement);
    if (this._wrapper) {
      this._contextMenuHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.scene.isActive('GameScene')) return;
        const gameXY = this.screenToGame(e.clientX, e.clientY);
        if (gameXY) tryShowChickenMenu(gameXY[0], gameXY[1]);
      };
      this._wrapper.addEventListener('contextmenu', this._contextMenuHandler, true);
    }
    // 2) Phaser pointerdown with button 2 in case it fires
    this.input.on('pointerdown', (pointer, localX, localY, event) => {
      if (event && event.button === 2) tryShowChickenMenu(pointer.x, pointer.y);
    });

    // Layout (scaled for 800x600: HP top-left, IDLE top-right, character center, ground line, 4 nav buttons)
    const Y_TOP = 40;
    const Y_GROUND = 370;
    const Y_CHAR = Y_GROUND - 78; // Character feet align with ground (legs extend ~42px below center)
    const Y_NAV = 545;
    const PAD = 30;

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

    const createActionButton = (x, y, w, h, label, action) => {
      const box = this.add.graphics();
      const redraw = (hover = false) => {
        box.clear();
        box.fillStyle(hover ? 0x444466 : 0x333355, hover ? 0.95 : 0.9);
        box.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
        box.lineStyle(1, hover ? 0x8888cc : 0x6666aa);
        box.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      };
      redraw();
      const labelTxt = txt(x, y, label, 0xeaeaea).setOrigin(0.5);
      const hit = this.add.rectangle(x, y, w, h);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => redraw(true));
      hit.on('pointerout', () => redraw(false));
      hit.on('pointerdown', action);
      return { box, labelTxt, hit };
    };

    const createNavButton = (x, y, w, h, label, openMenu) => {
      const box = this.add.graphics();
      const redraw = (hover = false) => {
        box.clear();
        box.fillStyle(hover ? 0x2a2a44 : 0x1a1a33, 0.95);
        box.fillRoundedRect(x - w / 2, y - h / 2, w, h, 3);
        box.lineStyle(1, 0x555588);
        box.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 3);
      };
      redraw();
      const labelTxt = txt(x, y, label, 0xaaaaee, 10).setOrigin(0.5);
      const hit = this.add.rectangle(x, y, w, h);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => redraw(true));
      hit.on('pointerout', () => redraw(false));
      hit.on('pointerdown', openMenu);
      return { box, labelTxt, hit };
    };

    // Background layer — chicken coop interior (like reference)
    this.backgroundLayer = this.add.container(0, 0);
    this.backgroundLayer.setDepth(-100);
    const bg = this.backgroundLayer;

    // Back wall (wooden plywood)
    const wallG = this.add.graphics();
    wallG.fillStyle(0xc4a574, 1);
    wallG.fillRect(0, 0, W, Y_GROUND + 50);
    wallG.fillStyle(0xb8956a, 0.6);
    for (let i = 0; i < 12; i++) {
      wallG.fillRect((i % 2) * 70 + 10, i * 55, 65, 50);
    }
    wallG.lineStyle(1, 0xa08050);
    for (let i = 0; i < 8; i++) {
      wallG.lineBetween(i * 100, 0, i * 100, Y_GROUND);
    }
    bg.add(wallG);

    // Ceiling (darker wood)
    const ceilG = this.add.graphics();
    ceilG.fillStyle(0x8b7355, 0.9);
    ceilG.fillRect(0, 0, W, 120);
    ceilG.fillStyle(0x7a6347, 0.5);
    ceilG.fillRect(0, 0, W, 60);
    bg.add(ceilG);

    // Straw floor (golden yellow)
    const floorG = this.add.graphics();
    floorG.fillStyle(0xd4a84b, 1);
    floorG.fillRect(0, Y_GROUND - 15, W, H - Y_GROUND + 30);
    floorG.fillStyle(0xe8c45a, 0.7);
    for (let i = 0; i < 25; i++) {
      const x = (i * 47) % (W + 30) - 15;
      const y = Y_GROUND + (Math.floor(i / 5) * 18) % 60;
      floorG.fillEllipse(x, y, 25, 8);
    }
    floorG.fillStyle(0xc99a3a, 0.4);
    for (let i = 0; i < 15; i++) {
      floorG.fillEllipse(100 + (i * 53) % (W - 100), Y_GROUND + 30 + (i * 7) % 40, 20, 6);
    }
    bg.add(floorG);

    // Nesting boxes (left, angled corner structure)
    const nestX = 90;
    const nestY = Y_GROUND - 30;
    const nestG = this.add.graphics();
    nestG.fillStyle(0x9b7b4b, 1);
    nestG.fillRect(nestX - 70, nestY - 10, 140, 95);
    nestG.lineStyle(2, 0x6b5344);
    nestG.strokeRect(nestX - 70, nestY - 10, 140, 95);
    nestG.fillStyle(0xb8956a, 0.95);
    nestG.fillRect(nestX - 65, nestY - 5, 130, 85);
    for (let c = 0; c < 5; c++) {
      nestG.fillStyle(0x8b7355, 0.8);
      nestG.fillRect(nestX - 60 + c * 28, nestY + 5, 24, 35);
      nestG.lineStyle(1, 0x6b5344);
      nestG.strokeRect(nestX - 60 + c * 28, nestY + 5, 24, 35);
      nestG.fillStyle(0xe8d48b, 0.9);
      nestG.fillEllipse(nestX - 48 + c * 28, nestY + 28, 14, 10);
    }
    bg.add(nestG);

    // Roosting perches (center-back, 3 horizontal bars)
    const perchY1 = Y_GROUND - 130;
    const perchY2 = Y_GROUND - 95;
    const perchY3 = Y_GROUND - 60;
    const perchG = this.add.graphics();
    perchG.fillStyle(0x6b5344, 1);
    perchG.fillRoundedRect(220, perchY1 - 6, 360, 14, 4);
    perchG.fillRoundedRect(220, perchY2 - 6, 360, 14, 4);
    perchG.fillRoundedRect(220, perchY3 - 6, 360, 14, 4);
    perchG.lineStyle(2, 0x5d4a3a);
    perchG.strokeRoundedRect(220, perchY1 - 6, 360, 14, 4);
    perchG.strokeRoundedRect(220, perchY2 - 6, 360, 14, 4);
    perchG.strokeRoundedRect(220, perchY3 - 6, 360, 14, 4);
    bg.add(perchG);

    // Left wall (angled, wood)
    const leftWallG = this.add.graphics();
    leftWallG.fillStyle(0xa08060, 0.85);
    leftWallG.fillTriangle(0, 0, 0, H, 180, Y_GROUND + 20);
    leftWallG.lineStyle(1, 0x8b7355);
    for (let i = 0; i < 6; i++) {
      leftWallG.lineBetween(0, 80 + i * 80, 150, Y_GROUND - 50 + i * 20);
    }
    bg.add(leftWallG);

    // Right wall
    const rightWallG = this.add.graphics();
    rightWallG.fillStyle(0xa08060, 0.85);
    rightWallG.fillTriangle(W, 0, W, H, W - 180, Y_GROUND + 20);
    rightWallG.lineStyle(1, 0x8b7355);
    for (let i = 0; i < 6; i++) {
      rightWallG.lineBetween(W, 80 + i * 80, W - 150, Y_GROUND - 50 + i * 20);
    }
    bg.add(rightWallG);

    // Ground edge (where straw meets wall)
    const edgeG = this.add.graphics();
    edgeG.fillStyle(0x8b7355, 0.7);
    edgeG.fillRect(0, Y_GROUND - 5, W, 12);
    edgeG.lineStyle(2, 0x6b5344);
    edgeG.lineBetween(0, Y_GROUND - 2, W, Y_GROUND - 2);
    bg.add(edgeG);

    // Rounded frame
    const frame = this.add.graphics();
    frame.lineStyle(2, 0x444466);
    frame.strokeRoundedRect(8, 8, W - 16, H - 16, 16);

    // Top-left: HP
    const hp = player.stats.hitpoints;
    const hpStr = `${hp.current}/${hp.level} HP`;
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x222244, 0.9);
    hpBg.fillRoundedRect(PAD, Y_TOP - 12, 112, 36, 8);
    this.hpLabel = txt(PAD + 56, Y_TOP + 6, hpStr, 0xaaffaa, 10).setOrigin(0.5, 0.5);

    // Top-center: location label
    this.currentLocation = 'Lumby Coop';
    const locBoxW = 140;
    const locBoxH = 36;
    const locBg = this.add.graphics();
    locBg.fillStyle(0x222244, 0.9);
    locBg.fillRoundedRect(centerX - locBoxW / 2, Y_TOP - 12, locBoxW, locBoxH, 8);
    locBg.lineStyle(1, 0x444466);
    locBg.strokeRoundedRect(centerX - locBoxW / 2, Y_TOP - 12, locBoxW, locBoxH, 8);
    this.locationLabel = txt(centerX, Y_TOP + 6, this.currentLocation, 0xccccdd, 10).setOrigin(0.5, 0.5);

    // Top-right: status (IDLE)
    const statusBg = this.add.graphics();
    statusBg.fillStyle(0x222244, 0.9);
    statusBg.fillRoundedRect(W - PAD - 88, Y_TOP - 12, 88, 36, 8);
    this.statusLabel = txt(W - PAD - 44, Y_TOP + 6, 'IDLE', 0xaaaacc, 10).setOrigin(0.5, 0.5);

    // Character — positioned left of center (per layout)
    const scaperX = centerX - 100;
    this.scaper = this.add.container(scaperX, Y_CHAR);
    this.scaperBaseX = scaperX;
    this.scaperBaseY = Y_CHAR;
    const scaper = this.scaper;
    const skin = 0xffddbb;
    const shirt = 0x558855;
    const pants = 0xccaa88;
    const g = this.add.graphics();
    // head
    g.fillStyle(skin, 1);
    g.fillCircle(0, -22, 14);
    g.lineStyle(1, 0x886644);
    g.strokeCircle(0, -22, 14);
    // body (torso) — green shirt
    g.fillStyle(shirt, 1);
    g.fillRoundedRect(-12, -6, 24, 28, 4);
    g.lineStyle(1, 0x336633);
    g.strokeRoundedRect(-12, -6, 24, 28, 4);
    // arms (holding at sides)
    g.lineStyle(3, skin);
    g.lineBetween(-14, 0, -26, 8);
    g.lineBetween(14, 0, 26, 8);
    // legs — tan pants
    g.lineStyle(3, pants);
    g.lineBetween(-6, 22, -8, 42);
    g.lineBetween(6, 22, 8, 42);
    scaper.add(g);
    scaper.setScale(3);

    // Idle animation — gentle bob (stored so we can pause/resume it)
    this.scaperIdleTween = this.tweens.add({
      targets: scaper,
      y: Y_CHAR - 5,
      duration: 900,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Chicken (right side, slightly forward) — feet align with ground (legs extend 56px at 2× scale)
    const chickenX = centerX + 180;
    const chickenY = Y_GROUND - 56;
    this.chickenBaseX = chickenX;
    this.chickenBaseY = chickenY;
    this.createChicken(chickenX, chickenY);
    
    // Ground line
    const ground = this.add.graphics();
    ground.lineStyle(1, 0x555566);
    ground.lineBetween(PAD, Y_GROUND, W - PAD, Y_GROUND);

    // Nav bar: 4 buttons — stats, inventory, equipment, menu
    const navBtnW = 96;
    const navBtnH = 40;
    const navGap = 8;
    const navTotal = navBtnW * 4 + navGap * 3;
    const navStartX = centerX - navTotal / 2 + navBtnW / 2 + navGap / 2;
    const navCenters = [
      navStartX,
      navStartX + navBtnW + navGap,
      navStartX + (navBtnW + navGap) * 2,
      navStartX + (navBtnW + navGap) * 3
    ];

    const openMenu = (panel) => {
      this.statsPanel.setVisible(panel === 'stats');
      this.inventoryPanel.setVisible(panel === 'inventory');
      this.equipmentPanel.setVisible(panel === 'equipment');
      
      // Refresh inventory display when opening
      if (panel === 'inventory') {
        this.refreshInventoryDisplay();
      }
      
      // Update XP bar when stats panel is opened
      if (panel === 'stats') {
        this.updateExpBar();
      }
    };

    createNavButton(navCenters[0], Y_NAV, navBtnW, navBtnH, 'Stats', () => openMenu('stats'));
    createNavButton(navCenters[1], Y_NAV, navBtnW, navBtnH, 'Inv', () => openMenu('inventory'));
    createNavButton(navCenters[2], Y_NAV, navBtnW, navBtnH, 'Equip', () => openMenu('equipment'));
    createNavButton(navCenters[3], Y_NAV, navBtnW, navBtnH, 'Map', () => {
      this.statsPanel.setVisible(false);
      this.inventoryPanel.setVisible(false);
      this.equipmentPanel.setVisible(false);
      this.scene.start('OverworldMapScene', { from: 'GameScene' });
    });

    // --- Stats panel ---
    this.statsPanel = this.add.container(0, 0);
    this.statsPanel.setVisible(false);
    this.statsPanel.setDepth(800); // Above game world (chicken, loot) so UI always on top
    this.buildStatsPanel(this.statsPanel, txt, W, H);
    const closeStats = createActionButton(W - 60, 50, 72, 36, 'Close', () => openMenu(null));
    this.statsPanel.add([closeStats.box, closeStats.labelTxt, closeStats.hit]);

    // --- Inventory panel ---
    this.inventoryPanel = this.add.container(0, 0);
    this.inventoryPanel.setVisible(false);
    this.inventoryPanel.setDepth(800); // Above game world so chicken/loot don't show through
    this.buildInventoryPanel(this.inventoryPanel, txt, W, H);
    const closeInv = createActionButton(W - 60, 50, 72, 36, 'Close', () => openMenu(null));
    this.inventoryPanel.add([closeInv.box, closeInv.labelTxt, closeInv.hit]);

    // --- Equipment panel ---
    this.equipmentPanel = this.add.container(0, 0);
    this.equipmentPanel.setVisible(false);
    this.equipmentPanel.setDepth(800);
    this.buildEquipmentPanel(this.equipmentPanel, txt, W, H);
    const closeEquip = createActionButton(W - 60, 50, 72, 36, 'Close', () => openMenu(null));
    this.equipmentPanel.add([closeEquip.box, closeEquip.labelTxt, closeEquip.hit]);

    // Right-click context menu (blocker + panel; panel content filled in showNpcContextMenu)
    this.contextMenuContainer = this.add.container(0, 0);
    this.contextMenuContainer.setVisible(false);
    this.contextMenuContainer.setDepth(1000);
    const blocker = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0);
    blocker.setInteractive({ useHandCursor: false });
    blocker.on('pointerdown', () => this.closeContextMenu());
    this.contextMenuContainer.add(blocker);
    this.contextMenuPanel = this.add.container(0, 0);
    this.contextMenuContainer.add(this.contextMenuPanel);

    // Combat state
    this.combatState = null;
    this.combatNpc = null; // reference to NPC being fought
    this.damageNumbers = []; // floating damage text
    this.chickenHpBar = null; // HP bar overlay for chicken
    this.playerHpBar = null; // HP bar overlay for player
    this.groundLoot = []; // array of ground loot items { container, itemId, quantity, x, y }
    this.inventorySlotContainers = []; // Initialize early to prevent errors
    this.chickenWanderTween = null; // Tween for chicken wandering movement
  }

  showNpcContextMenu(worldX, worldY, npcKey) {
    this.closeContextMenu();
    const W = this.gameW;
    const H = this.gameH;
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
    const options =
      npcKey === 'chicken'
        ? [
            { label: 'Fight (combat)', action: () => { this.startCombat('chicken'); } },
            { label: 'Catch (hunter)', action: () => { this.statusLabel.setText('CATCH'); } },
            { label: 'Cancel', action: () => {} }
          ]
        : [{ label: 'Cancel', action: () => {} }];
    const menuH = options.length * (optionH + optionGap) + optionGap * 2;

    const panelX = Phaser.Math.Clamp(worldX, menuW / 2 + 8, W - menuW / 2 - 8);
    const offsetBelow = 8;
    const panelY = Phaser.Math.Clamp(worldY + offsetBelow, 8, H - menuH - 8);
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
      hit.on('pointerdown', () => {
        this.closeContextMenu();
        opt.action();
      });
      this.contextMenuPanel.add([box, labelTxt, hit]);
    });

    this.contextMenuContainer.setVisible(true);
  }

  closeContextMenu() {
    if (this.contextMenuContainer) this.contextMenuContainer.setVisible(false);
  }

  /** Convert screen (client) coords to game world coords. Returns [x, y] or null if off game area. */
  screenToGame(clientX, clientY) {
    const canvas = this.sys.game.canvas;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;
    const relX = (clientX - bounds.left) / bounds.width;
    const relY = (clientY - bounds.top) / bounds.height;
    if (relX < 0 || relX > 1 || relY < 0 || relY > 1) return null;
    return [relX * this.gameW, relY * this.gameH];
  }

  /** True if (world x, y) is over the chicken's hit area. */
  hitTestChicken(worldX, worldY) {
    if (!this.chicken) return false;
    const c = this.chicken;
    const w = 100;
    const h = 70;
    const left = c.x - w / 2;
    const top = c.y - h / 2;
    return worldX >= left && worldX <= left + w && worldY >= top && worldY <= top + h;
  }

  buildStatsPanel(container, txt, W, H) {
    const player = getPlayer();
    const stats = player.stats;
    const fmt = (id) => {
      const s = stats[id];
      const level = s.current !== undefined ? `${s.current}/${s.level}` : s.level;
      return `${id.charAt(0).toUpperCase() + id.slice(1)}: ${level}`;
    };

    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.98);
    bg.fillRect(0, 0, W, H);
    container.add(bg);

    container.add(txt(W / 2, 24, 'Stats', 0xffffff, 14).setOrigin(0.5));
    
    // Experience bar at top
    const expBarY = 48;
    const expBarW = W - 32;
    const expBarH = 8;
    const expBarX = 16;
    
    // XP bar background
    const expBg = this.add.graphics();
    expBg.fillStyle(0x222244, 1);
    expBg.fillRoundedRect(expBarX, expBarY - expBarH / 2, expBarW, expBarH, 2);
    expBg.lineStyle(1, 0x444466);
    expBg.strokeRoundedRect(expBarX, expBarY - expBarH / 2, expBarW, expBarH, 2);
    container.add(expBg);
    
    // XP bar fill (purple/blue gradient)
    this.statsExpFill = this.add.graphics();
    container.add(this.statsExpFill);

    // XP text (create before updateExpBar so setText has valid target)
    this.statsExpText = txt(W / 2, expBarY + 12, `XP: ${player.experience || 0}`, 0xaaaaff, 8);
    this.statsExpText.setOrigin(0.5);
    container.add(this.statsExpText);

    this.updateExpBar();
    
    const colY = 76;
    const rowH = 20;

    container.add(txt(48, colY, 'Combat', 0xa0a0ff));
    const combatIds = ['attack', 'strength', 'defense', 'hitpoints', 'prayer', 'magic', 'ranged', 'agility'];
    combatIds.forEach((id, i) => {
      container.add(txt(16, colY + 24 + i * rowH, fmt(id)));
    });

    container.add(txt(368, colY, 'Skills', 0xa0ffa0));
    const skillIds = ['cooking', 'fishing', 'mining', 'smithing', 'crafting', 'hunting'];
    skillIds.forEach((id, i) => {
      container.add(txt(336, colY + 24 + i * rowH, fmt(id)));
    });
  }
  
  createChicken(x, y) {
    if (this.chicken) return;
    
    this.chickenBaseX = x;
    this.chickenBaseY = y;
    const chicken = this.add.container(x, y);
    const cg = this.add.graphics();
    // body
    cg.fillStyle(0xf5f5e6, 1);
    cg.fillEllipse(0, 0, 22, 18);
    cg.lineStyle(1, 0xccccaa);
    cg.strokeEllipse(0, 0, 22, 18);
    // head
    cg.fillStyle(0xf5f5e6, 1);
    cg.fillCircle(14, -10, 10);
    cg.lineStyle(1, 0xccccaa);
    cg.strokeCircle(14, -10, 10);
    // comb
    cg.fillStyle(0xdd2222, 1);
    cg.fillCircle(18, -14, 4);
    cg.fillCircle(20, -11, 3);
    cg.fillCircle(18, -8, 3);
    // beak
    cg.fillStyle(0xff9922, 1);
    cg.fillTriangle(22, -10, 30, -8, 22, -6);
    cg.lineStyle(1, 0xcc7711);
    cg.strokeTriangle(22, -10, 30, -8, 22, -6);
    // eye
    cg.fillStyle(0x222222, 1);
    cg.fillCircle(17, -11, 2);
    // legs
    cg.lineStyle(2, 0xff9922);
    cg.lineBetween(-6, 16, -8, 28);
    cg.lineBetween(6, 16, 8, 28);
    chicken.add(cg);
    chicken.setScale(2);

    // Chicken idle animation (stored so we can pause/resume it)
    this.chickenIdleTween = this.tweens.add({
      targets: chicken,
      y: y - 3,
      duration: 600,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.chicken = chicken;
    chicken.setDepth(100);

    // Start wandering movement (only when not in combat)
    this.startChickenWandering();
  }
  
  startChickenWandering() {
    if (!this.chicken || this.combatState) return;
    
    // Stop existing wander tween
    if (this.chickenWanderTween) {
      this.chickenWanderTween.stop();
      this.chickenWanderTween = null;
    }
    
    const wanderRadius = 40; // pixels from base position
    const wanderSpeed = 2000; // ms to complete one wander cycle
    const pauseDuration = 800 + Math.random() * 700; // 800-1500ms pause at destination
    
    // Random target position within wander radius
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * wanderRadius;
    const targetX = this.chickenBaseX + Math.cos(angle) * distance;
    const targetY = this.chickenBaseY + Math.sin(angle) * distance;
    
    // Face the direction we're moving
    const dx = targetX - this.chicken.x;
    if (dx > 0) {
      this.chicken.setScale(2, 2);
    } else if (dx < 0) {
      this.chicken.setScale(-2, 2);
    }
    
    this.chickenWanderTween = this.tweens.add({
      targets: this.chicken,
      x: targetX,
      y: targetY,
      duration: wanderSpeed,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Pause for a bit, then pick a new random direction
        if (!this.combatState && this.chicken) {
          this.time.delayedCall(pauseDuration, () => {
            if (!this.combatState && this.chicken) {
              this.startChickenWandering();
            }
          });
        }
      }
    });
  }
  
  updateChickenFacing() {
    if (!this.chicken || !this.scaper || !this.combatState) return;
    
    // Calculate direction to player
    const dx = this.scaper.x - this.chicken.x;
    
    // Flip chicken horizontally to face player (negative scaleX = flip)
    if (dx > 0) {
      // Player is to the right, chicken faces right (normal)
      this.chicken.setScale(2, 2);
    } else {
      // Player is to the left, chicken faces left (flipped)
      this.chicken.setScale(-2, 2);
    }
  }
  
  updateExpBar() {
    if (!this.statsExpFill) return;
    const player = getPlayer();
    const exp = player.experience || 0;
    
    // Simple XP system: every 100 XP = 1 level (visual only for now)
    const expPerLevel = 100;
    const expInCurrentLevel = exp % expPerLevel;
    const expPercent = expInCurrentLevel / expPerLevel;
    
    const expBarW = this.gameW - 32;
    const expBarH = 8;
    const expBarX = 16;
    const expBarY = 48;
    const fillW = expBarW * expPercent;
    
    this.statsExpFill.clear();
    this.statsExpFill.fillStyle(0x6666ff, 1);
    this.statsExpFill.fillRoundedRect(expBarX, expBarY - expBarH / 2, fillW, expBarH, 2);
    
    if (this.statsExpText && this.statsExpText.setText) {
      try {
        this.statsExpText.setText(`XP: ${exp}`);
      } catch (e) {
        console.warn('updateExpBar setText failed:', e);
      }
    }
  }
  
  dropLoot(npcId, x, y) {
    try {
      if (npcId === 'chicken') {
        const loot = [];
        
        // 100% drops
        loot.push({ itemId: 'bones', quantity: 1 });
        loot.push({ itemId: 'raw_chicken', quantity: 1 });
        const featherQty = 20 + Math.floor(Math.random() * 31); // 20-50
        loot.push({ itemId: 'feathers', quantity: featherQty });
        
        // 50% chance for egg
        if (Math.random() < 0.5) {
          loot.push({ itemId: 'egg', quantity: 1 });
        }
        
        // Create ground loot items (spread them out around the death location)
        const spreadRadius = 30;
        loot.forEach((lootItem, i) => {
          const angle = (i / loot.length) * Math.PI * 2;
          const offsetX = Math.cos(angle) * spreadRadius;
          const offsetY = Math.sin(angle) * spreadRadius;
          this.createGroundLoot(x + offsetX, y + offsetY, lootItem.itemId, lootItem.quantity);
        });
      }
    } catch (error) {
      console.error('Error dropping loot:', error);
    }
  }
  
  createGroundLoot(x, y, itemId, quantity) {
    try {
      const itemData = ITEMS[itemId];
      if (!itemData) {
        console.warn('Unknown item:', itemId);
        return;
      }

      const hex = (n) => '#' + n.toString(16).padStart(6, '0');
      const txt = (px, py, text, color = 0xeaeaea, size = 10) => {
        const c = typeof color === 'number' ? hex(color) : color;
        const t = this.add.text(px, py, text, {
          fontSize: `${size}px`,
          fontFamily: '"Press Start 2P", monospace',
          color: c
        });
        t.setPadding(10, 6, 10, 6);
        return t;
      };

      // Create container for the loot item
      const container = this.add.container(x, y);
      container.setDepth(400); // Above ground, below UI

      // Icon (procedural, same as inventory)
      const icon = this.createItemIcon(itemId);
      icon.setScale(1.4); // Slightly larger for ground visibility
      container.add(icon);

      // Quantity badge if > 1
      if (quantity > 1) {
        const qtyText = txt(0, 18, `(${quantity})`, 0xffff88, 7);
        qtyText.setOrigin(0.5);
        container.add(qtyText);
      }

      // Subtle backdrop for visibility on straw
      const boxW = 36;
      const boxH = 36;
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a22, 0.6);
      bg.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 4);
      bg.lineStyle(1, 0x444466);
      bg.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 4);
      container.addAt(bg, 0); // Behind icon

      // Make it clickable
      const hitArea = this.add.rectangle(0, 0, boxW, boxH);
      hitArea.setInteractive({ useHandCursor: true });
      hitArea.on('pointerdown', () => {
        this.pickupLoot(container, itemId, quantity);
      });
      container.add(hitArea);
      
      // Gentle float animation
      this.tweens.add({
        targets: container,
        y: y - 3,
        duration: 1000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // Store reference
      if (!this.groundLoot) this.groundLoot = [];
      this.groundLoot.push({ container, itemId, quantity, x, y });
    } catch (error) {
      console.error('Error creating ground loot:', error);
    }
  }
  
  pickupLoot(lootContainer, itemId, quantity) {
    const player = getPlayer();
    if (!player.inventory) {
      player.inventory = [];
    }
    
    // Add to inventory
    let added = false;
    const itemData = ITEMS[itemId];
    if (itemData && itemData.stackable) {
      // Try to stack with existing item
      for (let i = 0; i < player.inventory.length; i++) {
        const slot = player.inventory[i];
        if (slot && slot.itemId === itemId) {
          slot.quantity = (slot.quantity || 1) + quantity;
          added = true;
          break;
        }
      }
    }
    // Add to new slot if not stacked
    if (!added && player.inventory.length < 48) {
      player.inventory.push({ itemId, quantity });
    }
    
    // Remove from ground
    const index = this.groundLoot.findIndex(l => l.container === lootContainer);
    if (index !== -1) {
      this.groundLoot.splice(index, 1);
    }
    
    // Animate pickup (float up and fade)
    this.tweens.add({
      targets: lootContainer,
      y: lootContainer.y - 30,
      alpha: 0,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        lootContainer.destroy();
      }
    });
    
    // Show pickup notification
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
    const itemName = itemData?.name || itemId;
    const notif = txt(lootContainer.x, lootContainer.y - 20, `+${quantity} ${itemName}`, 0x88ff88, 8);
    notif.setOrigin(0.5);
    this.tweens.add({
      targets: notif,
      y: notif.y - 20,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => notif.destroy()
    });

    // Refresh inventory display if containers are ready (panel has been built)
    // If containers aren't ready yet, the refresh will happen when the panel is opened
    if (this.refreshInventoryDisplay && this.inventorySlotContainers && this.inventorySlotContainers.length > 0) {
      this.refreshInventoryDisplay();
    }
  }

  buildInventoryPanel(container, txt, W, H) {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.98);
    bg.fillRect(0, 0, W, H);
    container.add(bg);

    container.add(txt(W / 2, 24, 'Inventory', 0xffffff, 14).setOrigin(0.5));

    const slotSize = 72;
    const padding = 12;
    const slotColor = 0x333355;
    const slotBorder = 0x555588;
    const cols = 8;
    const rows = 6;
    const gridW = cols * slotSize + (cols - 1) * padding;
    const gridH = rows * slotSize + (rows - 1) * padding;
    const left = (W - gridW) / 2 + slotSize / 2;
    const top = 88 + slotSize / 2;
    const stepX = slotSize + padding;
    const stepY = slotSize + padding;

    // Ensure array exists (should already be initialized in create(), but be safe)
    if (!this.inventorySlotContainers) {
      this.inventorySlotContainers = [];
    } else {
      this.inventorySlotContainers.length = 0; // Clear existing
    }
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = left + col * stepX;
        const y = top + row * stepY;
        // Create slot container - position will be relative to panel container
        const slotContainer = this.add.container(x, y);
        const g = this.add.graphics();
        g.fillStyle(slotColor, 0.9);
        g.fillRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 8);
        g.lineStyle(1, slotBorder);
        g.strokeRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 8);
        slotContainer.add(g);
        // Add to panel container - Phaser will handle coordinate transformation
        container.add(slotContainer);
        this.inventorySlotContainers.push(slotContainer);
      }
    }
    
    // Verify containers were created
    if (this.inventorySlotContainers.length !== cols * rows) {
      console.error(`buildInventoryPanel: Expected ${cols * rows} containers, got ${this.inventorySlotContainers.length}`);
    }
    
    this.refreshInventoryDisplay();
  }

  /**
   * Create a small pixel-style icon for an item. Returns a Container centered at (0,0).
   */
  createItemIcon(itemId) {
    const container = this.add.container(0, 0);
    const g = this.add.graphics();
    const s = 12; // half-size (icon ~24x24 for 72px slots)

    switch (itemId) {
      case 'raw_chicken': {
        // Drumstick: oval meat + bone end
        g.fillStyle(0xcc9966, 1);
        g.fillEllipse(0, 2, s * 1.4, s * 0.9);
        g.lineStyle(1, 0x996633);
        g.strokeEllipse(0, 2, s * 1.4, s * 0.9);
        g.fillStyle(0xeeddcc, 1);
        g.fillEllipse(s * 0.9, 2, s * 0.5, s * 0.6);
        g.lineStyle(1, 0xccbbaa);
        g.strokeEllipse(s * 0.9, 2, s * 0.5, s * 0.6);
        break;
      }
      case 'bones': {
        // Single dog bone: tapered shaft, lobed/peanut-shaped ends (two overlapping ellipses per end)
        g.fillStyle(0xeeddcc, 1);
        g.lineStyle(1, 0xccbbaa);
        const lobe = s * 0.3;
        const shaftW = s * 0.24;
        // Left end - peanut shape (two vertical lobes)
        g.fillEllipse(-s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
        g.fillEllipse(-s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
        g.strokeEllipse(-s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
        g.strokeEllipse(-s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
        // Right end
        g.fillEllipse(s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
        g.fillEllipse(s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
        g.strokeEllipse(s * 0.68, -lobe * 0.35, lobe * 1.15, lobe);
        g.strokeEllipse(s * 0.68, lobe * 0.35, lobe * 1.15, lobe);
        // Shaft - connects the lobed ends
        g.fillRoundedRect(-s * 0.55, -shaftW / 2, s * 1.1, shaftW, 3);
        g.strokeRoundedRect(-s * 0.55, -shaftW / 2, s * 1.1, shaftW, 3);
        break;
      }
      case 'feathers': {
        // Single feather: teardrop + quill
        g.fillStyle(0xf5f5f0, 1);
        g.fillEllipse(-s * 0.3, 0, s * 1.1, s * 1.4);
        g.lineStyle(1, 0xddddcc);
        g.strokeEllipse(-s * 0.3, 0, s * 1.1, s * 1.4);
        g.lineStyle(2, 0xbbaa99);
        g.lineBetween(-s * 0.3, -s * 1.2, -s * 0.3, s * 1.2);
        break;
      }
      case 'egg': {
        g.fillStyle(0xfaf8f0, 1);
        g.fillEllipse(0, 0, s * 0.8, s * 1.0);
        g.lineStyle(1, 0xddddcc);
        g.strokeEllipse(0, 0, s * 0.8, s * 1.0);
        break;
      }
      case 'bronze_pickaxe': {
        g.fillStyle(0x8b7355, 1);
        g.fillRect(-s * 0.3, -s * 1.2, s * 0.2, s * 2.2);
        g.fillStyle(0xcd7f32, 1);
        g.fillRect(-s * 0.9, s * 0.3, s * 1.4, s * 0.2);
        g.fillRect(-s * 0.85, s * 0.5, s * 0.25, s * 0.6);
        g.fillRect(s * 0.6, s * 0.5, s * 0.25, s * 0.6);
        break;
      }
      case 'copper_ore': {
        g.fillStyle(0xb87333, 1);
        g.fillEllipse(0, 0, s * 1.0, s * 0.8);
        g.lineStyle(1, 0x8b5a2b);
        g.strokeEllipse(0, 0, s * 1.0, s * 0.8);
        break;
      }
      case 'tin_ore': {
        g.fillStyle(0x808090, 1);
        g.fillEllipse(0, 0, s * 1.0, s * 0.8);
        g.lineStyle(1, 0x606070);
        g.strokeEllipse(0, 0, s * 1.0, s * 0.8);
        break;
      }
      default:
        // Generic box for unknown items
        g.fillStyle(0x666688, 0.8);
        g.fillRoundedRect(-s * 0.8, -s * 0.8, s * 1.6, s * 1.6, 2);
    }

    container.add(g);
    return container;
  }

  refreshInventoryDisplay() {
    // Get slot containers: use cached array, or derive from panel children if empty
    let slots = this.inventorySlotContainers;
    if (!slots || slots.length === 0) {
      // Panel order: bg(0), title(1), then 48 slot containers (2..49), then close button (50+)
      if (this.inventoryPanel && this.inventoryPanel.list && this.inventoryPanel.list.length >= 50) {
        slots = this.inventoryPanel.list.slice(2, 50);
        this.inventorySlotContainers = slots; // Cache for next time
      }
    }
    if (!slots || slots.length === 0) {
      return;
    }

    const player = getPlayer();
    if (!player.inventory) {
      player.inventory = [];
    }
    const inventory = player.inventory;

    for (let i = 0; i < slots.length; i++) {
      const slotContainer = slots[i];
      if (!slotContainer || !slotContainer.active) continue;

      // Remove all children except the first (the graphics box)
      while (slotContainer.length > 1) {
        const child = slotContainer.list[slotContainer.length - 1];
        slotContainer.removeAt(slotContainer.length - 1);
        if (child && child.destroy) child.destroy();
      }

      // Add name, icon, and quantity if slot has an item
      const slot = inventory[i];
      if (slot && slot.itemId) {
        const itemData = ITEMS[slot.itemId];
        const name = itemData ? itemData.name : slot.itemId;
        const qty = slot.quantity || 1;

        // Name above icon - narrower width with padding so no cutoff
        const nameText = this.makeText(0, -24, name, 0xddddff, 8);
        nameText.setOrigin(0.5);
        nameText.setWordWrapWidth(58);
        nameText.setAlpha(1);
        nameText.setVisible(true);
        slotContainer.add(nameText);

        // Icon centered
        const icon = this.createItemIcon(slot.itemId);
        slotContainer.add(icon);

        // Quantity below icon - use parentheses format for reliable rendering
        if (qty > 1) {
          const qtyText = this.makeText(0, 20, `(${qty})`, 0xeeeeff, 10);
          qtyText.setOrigin(0.5);
          qtyText.setAlpha(1);
          qtyText.setVisible(true);
          slotContainer.add(qtyText);
        }
      }
    }
  }

  buildEquipmentPanel(container, txt, W, H) {
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.98);
    bg.fillRect(0, 0, W, H);
    container.add(bg);

    container.add(txt(W / 2, 20, 'Equipment', 0xffffff, 14).setOrigin(0.5, 0));

    const slotSize = 72;
    const slotColor = 0x333355;
    const slotBorder = 0x555588;
    const rowH = 80;

    const addSlot = (x, y, label, fontSize = 10) => {
      const g = this.add.graphics();
      const h = slotSize;
      const w = slotSize;
      g.fillStyle(slotColor, 0.9);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      g.lineStyle(1, slotBorder);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      container.add(g);
      container.add(txt(x, y, label, 0xccccdd, fontSize).setOrigin(0.5));
    };

    // Center column: Head, Neck, Chest, Leg, Boot
    const cx = W / 2;
    const cyStart = 120;

    addSlot(cx, cyStart, 'Head');
    addSlot(cx, cyStart + rowH, 'Neck');
    addSlot(cx, cyStart + rowH * 2, 'Chest');
    addSlot(cx, cyStart + rowH * 3, 'Leg');
    addSlot(cx, cyStart + rowH * 4, 'Boot');

    // Left column: Cape, Weapon
    const leftX = 140;
    const leftY1 = 160;
    const leftY2 = leftY1 + rowH;

    addSlot(leftX, leftY1, 'Cape');
    addSlot(leftX, leftY2, 'Weapon');

    // Right column: Off-hand
    const rightX = W - 140;
    const rightY = 240;

    addSlot(rightX, rightY, 'Shield');
  }

  startCombat(npcId) {
    this.closeContextMenu();
    
    // Stop any existing combat
    if (this.combatState) {
      this.combatState.stop();
    }
    
    const player = getPlayer();
    const npcData = getNpc(npcId);
    if (!npcData) return;
    
    // Create combat entities from player stats and NPC data
    const weaponId = player.equipment?.weapon || 'unarmed';
    const weapon = getWeapon(weaponId);
    const playerCombat = {
      attackLevel: player.stats.attack.level,
      strengthLevel: player.stats.strength.level,
      defenseLevel: player.stats.defense.level,
      hitpoints: player.stats.hitpoints.current,
      maxHitpoints: player.stats.hitpoints.level,
      attackBonus: weapon.attackBonus || 0,
      strengthBonus: weapon.strengthBonus || 0,
      defenseBonus: 0,
      weapon
    };
    
    const npcCombat = {
      attackLevel: npcData.attack,
      strengthLevel: npcData.strength,
      defenseLevel: npcData.defense,
      hitpoints: npcData.hitpoints,
      maxHitpoints: npcData.hitpoints,
      attackBonus: npcData.attackBonus || 0,
      strengthBonus: npcData.strengthBonus || 0,
      defenseBonus: npcData.defenseBonus || 0,
      attackSpeed: npcData.attackSpeed
    };
    
    // Store reference to NPC for visual updates
    this.combatNpc = { id: npcId, data: npcData, combat: npcCombat };
    
    // Create combat state
    this.combatState = new CombatState(playerCombat, npcCombat, weaponId);
    // Set NPC's first attack delay: wait their full attackSpeed before first attack
    const currentTime = this.time.now;
    this.combatState.defenderNextAttack = currentTime + (npcCombat.attackSpeed || 3000);
    
    this.combatState.onAttack = (attacker, defender) => {
      this.animateAttack(attacker, defender);
    };
    this.combatState.onHit = (attacker, defender, result) => {
      this.onCombatHit(attacker, defender, result);
    };
    this.combatState.onCombatEnd = (winner, loser) => {
      this.onCombatEnd(winner, loser);
    };
    
    this.statusLabel.setText('FIGHTING');
    
    // Pause idle animations during combat
    if (this.scaperIdleTween) this.scaperIdleTween.pause();
    if (this.chickenIdleTween) this.chickenIdleTween.pause();
    if (this.chickenWanderTween) this.chickenWanderTween.pause();
    
    // Make chicken face player during combat
    this.updateChickenFacing();
    
    // Reset positions to base (in case idle animation moved them)
    if (this.scaper) {
      this.scaper.x = this.scaperBaseX;
      this.scaper.y = this.scaperBaseY;
    }
    if (this.chicken) {
      this.chicken.x = this.chickenBaseX;
      this.chicken.y = this.chickenBaseY;
    }
    
    // Create HP bars
    this.createChickenHpBar();
    this.createPlayerHpBar();
  }
  
  createChickenHpBar() {
    if (this.chickenHpBar && this.chickenHpBar.container) {
      this.chickenHpBar.container.destroy();
    }
    
    const barW = 60;
    const barH = 6;
    const barX = this.chicken ? this.chicken.x : this.chickenBaseX;
    const barY = (this.chicken ? this.chicken.y : this.chickenBaseY) - 50;
    
    const container = this.add.container(barX, barY);
    
    // Background (dark red)
    const bg = this.add.graphics();
    bg.fillStyle(0x330000, 0.9);
    bg.fillRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
    bg.lineStyle(1, 0x660000);
    bg.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
    
    // HP fill (green to red gradient)
    const hpFill = this.add.graphics();
    
    // Border
    const border = this.add.graphics();
    border.lineStyle(1, 0xffffff, 0.5);
    border.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
    
    container.add([bg, hpFill, border]);
    container.setDepth(500);
    
    this.chickenHpBar = { container, hpFill, barW, barH };
    this.updateChickenHpBar();
  }
  
  createPlayerHpBar() {
    if (this.playerHpBar && this.playerHpBar.container) {
      this.playerHpBar.container.destroy();
    }
    
    const barW = 100;
    const barH = 10;
    const barYOffset = 133; // 25px above top of head (head top ~108px up at 3x scale)
    const barX = this.scaper ? this.scaper.x : this.scaperBaseX;
    const barY = (this.scaper ? this.scaper.y : this.scaperBaseY) - barYOffset;
    
    const container = this.add.container(barX, barY);
    
    // Background (dark red)
    const bg = this.add.graphics();
    bg.fillStyle(0x330000, 0.9);
    bg.fillRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
    bg.lineStyle(1, 0x660000);
    bg.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
    
    // HP fill (green to red gradient)
    const hpFill = this.add.graphics();
    
    // Border
    const border = this.add.graphics();
    border.lineStyle(1, 0xffffff, 0.5);
    border.strokeRoundedRect(-barW / 2, -barH / 2, barW, barH, 2);
    
    container.add([bg, hpFill, border]);
    container.setDepth(500);
    
    this.playerHpBar = { container, hpFill, barW, barH };
    this.updatePlayerHpBar();
  }
  
  updatePlayerHpBar() {
    if (!this.playerHpBar || !this.combatState) return;
    
    try {
      const { hpFill, barW, barH } = this.playerHpBar;
      const player = this.combatState.attacker;
      
      if (!player || player.maxHitpoints <= 0) return;
      
      const hpPercent = Math.max(0, Math.min(1, player.hitpoints / player.maxHitpoints));
      const fillW = barW * hpPercent;
      
      // Color: green -> yellow -> red
      let color;
      if (hpPercent > 0.5) {
        // Green to yellow (100% to 50%) - at 100% should be pure green
        const t = (hpPercent - 0.5) * 2; // 0 to 1 (0 = 50% HP, 1 = 100% HP)
        const r = Math.floor(255 * (1 - t)); // 255 at 50%, 0 at 100%
        const g = 255;
        color = Phaser.Display.Color.GetColor(r, g, 0);
      } else {
        // Yellow to red (50% to 0%)
        const t = hpPercent * 2; // 0 to 1 (0 = 0% HP, 1 = 50% HP)
        const r = 255;
        const g = Math.floor(255 * t);
        color = Phaser.Display.Color.GetColor(r, g, 0);
      }
      
      hpFill.clear();
      hpFill.fillStyle(color, 1);
      hpFill.fillRoundedRect(-barW / 2, -barH / 2, fillW, barH, 2);
      
      // Update position to follow player (25px above top of head)
      if (this.scaper) {
        this.playerHpBar.container.setPosition(this.scaper.x, this.scaper.y - 133);
      }
    } catch (error) {
      console.error('Player HP bar update error:', error);
    }
  }
  
  updateChickenHpBar() {
    if (!this.chickenHpBar || !this.combatNpc || !this.combatNpc.combat) return;
    
    try {
      const { hpFill, barW, barH } = this.chickenHpBar;
      const npc = this.combatNpc.combat;
      
      if (!npc || npc.maxHitpoints <= 0) return;
      
      const hpPercent = Math.max(0, Math.min(1, npc.hitpoints / npc.maxHitpoints));
      const fillW = barW * hpPercent;
      
      // Color: green -> yellow -> red
      let color;
      if (hpPercent > 0.5) {
        // Green to yellow (100% to 50%) - at 100% should be pure green (r=0, g=255)
        const t = (hpPercent - 0.5) * 2; // 0 to 1 (0 = 50% HP, 1 = 100% HP)
        const r = Math.floor(255 * (1 - t)); // 255 at 50%, 0 at 100%
        const g = 255;
        color = Phaser.Display.Color.GetColor(r, g, 0);
      } else {
        // Yellow to red (50% to 0%)
        const t = hpPercent * 2; // 0 to 1 (0 = 0% HP, 1 = 50% HP)
        const r = 255;
        const g = Math.floor(255 * t);
        color = Phaser.Display.Color.GetColor(r, g, 0);
      }
      
      hpFill.clear();
      hpFill.fillStyle(color, 1);
      hpFill.fillRoundedRect(-barW / 2, -barH / 2, fillW, barH, 2);
    } catch (error) {
      console.error('HP bar update error:', error);
    }
  }
  
  animateAttack(attacker, defender) {
    if (!this.combatState || !this.combatState.active) return;
    
    try {
      const isPlayerAttacking = attacker === this.combatState.attacker;
      const attackerObj = isPlayerAttacking ? this.scaper : this.chicken;
      const defenderObj = isPlayerAttacking ? this.chicken : this.scaper;
      
      if (!attackerObj || !defenderObj || !this.combatState || !this.combatState.active) return;
      
      const attackerBaseX = isPlayerAttacking ? this.scaperBaseX : this.chickenBaseX;
      const attackerBaseY = isPlayerAttacking ? this.scaperBaseY : this.chickenBaseY;
      
      // Calculate direction toward defender
      const dx = defenderObj.x - attackerObj.x;
      const dy = defenderObj.y - attackerObj.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0 || !isFinite(dist)) return; // Avoid division by zero or NaN
      
      const moveDist = 12; // pixels to jerk forward
      const moveX = (dx / dist) * moveDist;
      const moveY = (dy / dist) * moveDist;
      
      // Stop any existing attack tweens on this object
      this.tweens.killTweensOf(attackerObj);
      
      // Reset to base position first (in case previous animation didn't finish)
      if (isFinite(attackerBaseX) && isFinite(attackerBaseY)) {
        attackerObj.x = attackerBaseX;
        attackerObj.y = attackerBaseY;
      }
      
      // Jerk forward then back
      this.tweens.add({
        targets: attackerObj,
        x: attackerBaseX + moveX,
        y: attackerBaseY + moveY,
        duration: 100,
        ease: 'Power2',
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          // Ensure we're back at base position
          if (attackerObj && this.combatState && this.combatState.active && 
              isFinite(attackerBaseX) && isFinite(attackerBaseY)) {
            attackerObj.x = attackerBaseX;
            attackerObj.y = attackerBaseY;
          }
        }
      });
    } catch (error) {
      console.error('Attack animation error:', error);
    }
  }
  
  onCombatHit(attacker, defender, result) {
    const player = getPlayer();
    
    // Update player HP if they were hit (defender is the player)
    if (defender === this.combatState.attacker) {
      player.stats.hitpoints.current = Math.max(0, defender.hitpoints);
    }
    
    // Update HP bars
    this.updateChickenHpBar();
    this.updatePlayerHpBar();
    
    // Show damage/miss indicator
    const isPlayerAttacking = attacker === this.combatState.attacker;
        const targetX = isPlayerAttacking ? (this.chicken ? this.chicken.x : this.chickenBaseX) : (this.scaper ? this.scaper.x : this.scaperBaseX);
    const targetY = isPlayerAttacking ? (this.chicken ? this.chicken.y - 30 : 220) : (this.scaper ? this.scaper.y - 30 : 220);
    
    if (!result.hit) {
      // Miss - show "MISS" in gray/yellow
      this.showMissIndicator(targetX, targetY);
    } else if (result.damage === 0) {
      // Hit but 0 damage - show "0" in yellow
      this.showDamageNumber(targetX, targetY, 0, 0xffff00);
    } else {
      // Normal hit - show damage in red
      this.showDamageNumber(targetX, targetY, result.damage);
    }
  }
  
  onCombatEnd(winner, loser) {
    const player = getPlayer();
    
    // Stop all combat-related tweens
    if (this.scaper) this.tweens.killTweensOf(this.scaper);
    if (this.chicken) this.tweens.killTweensOf(this.chicken);
    
    // Reset positions to base
    if (this.scaper) {
      this.scaper.x = this.scaperBaseX;
      this.scaper.y = this.scaperBaseY;
    }
    if (this.chicken) {
      this.chicken.x = this.chickenBaseX;
      this.chicken.y = this.chickenBaseY;
    }
    
    // Resume idle animations
    if (this.scaperIdleTween) this.scaperIdleTween.resume();
    if (this.chickenIdleTween) this.chickenIdleTween.resume();
    
    // Resume wandering if chicken exists
    if (this.chicken && !this.combatState) {
      this.startChickenWandering();
    }
    
    // Remove HP bars
    if (this.chickenHpBar && this.chickenHpBar.container) {
      this.chickenHpBar.container.destroy();
      this.chickenHpBar = null;
    }
    if (this.playerHpBar && this.playerHpBar.container) {
      this.playerHpBar.container.destroy();
      this.playerHpBar = null;
    }
    
    if (winner === this.combatState.attacker) {
      // Player won
      this.statusLabel.setText('VICTORY');
      
      // Award XP (chicken gives 5 XP)
      const player = getPlayer();
      player.experience = (player.experience || 0) + 5;
      
      // Update XP bar if stats panel is visible
      if (this.statsPanel && this.statsPanel.visible) {
        this.updateExpBar();
      }
      
      // Animate chicken death (fall over)
      if (this.chicken && this.combatNpc) {
        const lootX = this.chicken.x;
        const lootY = this.chicken.y;
        
        // Stop any existing tweens on chicken
        this.tweens.killTweensOf(this.chicken);
        
        // Death animation: rotate and fall
        this.tweens.add({
          targets: this.chicken,
          angle: 90, // Rotate 90 degrees (fall over)
          y: lootY + 20, // Fall down a bit
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            // Fade out
            if (this.chicken) {
              this.tweens.add({
                targets: this.chicken,
                alpha: 0,
                duration: 300,
                onComplete: () => {
                  if (this.chicken) {
                    this.chicken.destroy();
                    this.chicken = null;
                    
                    // Spawn loot on ground AFTER chicken fades
                    const npcId = this.combatNpc ? this.combatNpc.id : 'chicken';
                    this.dropLoot(npcId, lootX, lootY);
                    
                    // Reset chicken facing
                    if (this.chicken) {
                      this.chicken.setScale(2, 2);
                    }
                    
                    // Respawn chicken after 3 seconds
                    this.time.delayedCall(3000, () => {
                      if (!this.chicken && this.chickenBaseX !== undefined && this.chickenBaseY !== undefined) {
                        this.createChicken(this.chickenBaseX, this.chickenBaseY);
                      }
                    });
                  }
                }
              });
            }
          }
        });
      }
    } else {
      // Player lost
      this.statusLabel.setText('DEFEATED');
      player.stats.hitpoints.current = Math.max(1, Math.floor(player.stats.hitpoints.level / 2)); // Respawn at half HP
    }
    
    this.combatState = null;
    this.combatNpc = null;
    
    // Reset status after a delay
    this.time.delayedCall(2000, () => {
      if (!this.combatState) this.statusLabel.setText('IDLE');
    });
  }
  
  showDamageNumber(x, y, damage, color = 0xff6666) {
    const txt = this.makeText(x, y, `-${damage}`, color, 10);
    txt.setOrigin(0.5);
    
    this.tweens.add({
      targets: txt,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }
  
  showMissIndicator(x, y) {
    const txt = this.makeText(x, y, 'MISS', 0xaaaaaa, 10);
    txt.setOrigin(0.5);
    
    // Slight side-to-side wobble for misses
    this.tweens.add({
      targets: txt,
      x: x - 8,
      duration: 50,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.tweens.add({
          targets: txt,
          y: y - 30,
          alpha: 0,
          duration: 800,
          ease: 'Power2',
          onComplete: () => txt.destroy()
        });
      }
    });
  }

  shutdown() {
    if (this._wrapper && this._contextMenuHandler) {
      this._wrapper.removeEventListener('contextmenu', this._contextMenuHandler, true);
      this._wrapper = null;
      this._contextMenuHandler = null;
    }
  }

  update() {
    const player = getPlayer();
    const hp = player.stats.hitpoints;
    this.hpLabel.setText(`${hp.current}/${hp.level} HP`);
    
    // Update combat (with safety checks)
    if (this.combatState && this.combatState.active) {
      try {
        const time = this.time.now;
        const stillActive = this.combatState.update(time);
        
        if (!stillActive) {
          // Combat ended, cleanup will happen in onCombatEnd callback
          return;
        }
        
        // Sync player HP from combat state
        if (this.combatState && this.combatState.attacker) {
          player.stats.hitpoints.current = Math.max(0, this.combatState.attacker.hitpoints);
        }
        
        // Update chicken facing during combat
        this.updateChickenFacing();
        
        // Update HP bar positions (follow characters if they move) - throttle to avoid excessive updates
        if (this.chickenHpBar && this.chicken && this.combatNpc) {
          const barX = this.chicken.x;
          const barY = this.chicken.y - 50;
          // Only update if position changed significantly (avoid micro-updates)
          const currentX = this.chickenHpBar.container.x;
          const currentY = this.chickenHpBar.container.y;
          if (Math.abs(barX - currentX) > 1 || Math.abs(barY - currentY) > 1) {
            this.chickenHpBar.container.setPosition(barX, barY);
          }
        }
        if (this.playerHpBar && this.scaper) {
          const barX = this.scaper.x;
          const barY = this.scaper.y - 133;
          const currentX = this.playerHpBar.container.x;
          const currentY = this.playerHpBar.container.y;
          if (Math.abs(barX - currentX) > 1 || Math.abs(barY - currentY) > 1) {
            this.playerHpBar.container.setPosition(barX, barY);
          }
        }
      } catch (error) {
        console.error('Combat update error:', error);
        // Emergency cleanup
        if (this.combatState) {
          this.combatState.stop();
          this.combatState = null;
        }
      }
    }
  }
}
