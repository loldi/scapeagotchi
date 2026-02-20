/**
 * Shared Stats, Inventory, Equipment panels and nav bar (Stats, Inv, Equip, Map).
 * Call setupPlayerUI(scene, fromSceneKey) to add the full UI to any scene.
 */

import { getPlayer } from '../state/gameState.js';
import { ITEMS } from '../data/items.js';
import { createItemIcon } from './createItemIcon.js';

export function setupPlayerUI(scene, fromSceneKey) {
  const W = scene.scale.width;
  const H = scene.scale.height;
  const centerX = W / 2;
  const Y_NAV = 545;
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

  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  const txt = (x, y, text, color = 0xeaeaea, size = 10) => {
    const c = typeof color === 'number' ? hex(color) : color;
    const t = scene.add.text(x, y, text, {
      fontSize: `${size}px`,
      fontFamily: '"Press Start 2P", monospace',
      color: c
    });
    t.setPadding(10, 6, 10, 6);
    return t;
  };

  const createActionButton = (x, y, w, h, label, action) => {
    const box = scene.add.graphics();
    const redraw = (hover = false) => {
      box.clear();
      box.fillStyle(hover ? 0x444466 : 0x333355, hover ? 0.95 : 0.9);
      box.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      box.lineStyle(1, hover ? 0x8888cc : 0x6666aa);
      box.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };
    redraw();
    const labelTxt = txt(x, y, label, 0xeaeaea).setOrigin(0.5);
    const hit = scene.add.rectangle(x, y, w, h);
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => redraw(true));
    hit.on('pointerout', () => redraw(false));
    hit.on('pointerdown', action);
    return { box, labelTxt, hit };
  };

  const createNavButton = (x, y, w, h, label, openMenu) => {
    const box = scene.add.graphics();
    const redraw = (hover = false) => {
      box.clear();
      box.fillStyle(hover ? 0x2a2a44 : 0x1a1a33, 0.95);
      box.fillRoundedRect(x - w / 2, y - h / 2, w, h, 3);
      box.lineStyle(1, 0x555588);
      box.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 3);
    };
    redraw();
    const labelTxt = txt(x, y, label, 0xaaaaee, 10).setOrigin(0.5);
    const hit = scene.add.rectangle(x, y, w, h);
    hit.setInteractive({ useHandCursor: true });
    hit.on('pointerover', () => redraw(true));
    hit.on('pointerout', () => redraw(false));
    hit.on('pointerdown', openMenu);
    scene.add.existing(box);
    scene.add.existing(labelTxt);
    scene.add.existing(hit);
  };

  scene.statsPanel = scene.add.container(0, 0);
  scene.statsPanel.setVisible(false);
  scene.statsPanel.setDepth(800);
  buildStatsPanel(scene, scene.statsPanel, txt, W, H);
  const closeStats = createActionButton(W - 60, 50, 72, 36, 'Close', () => openMenu(null));
  scene.statsPanel.add([closeStats.box, closeStats.labelTxt, closeStats.hit]);

  scene.inventoryPanel = scene.add.container(0, 0);
  scene.inventoryPanel.setVisible(false);
  scene.inventoryPanel.setDepth(800);
  buildInventoryPanel(scene, scene.inventoryPanel, txt, W, H);
  const closeInv = createActionButton(W - 60, 50, 72, 36, 'Close', () => openMenu(null));
  scene.inventoryPanel.add([closeInv.box, closeInv.labelTxt, closeInv.hit]);

  scene.equipmentPanel = scene.add.container(0, 0);
  scene.equipmentPanel.setVisible(false);
  scene.equipmentPanel.setDepth(800);
  buildEquipmentPanel(scene, scene.equipmentPanel, txt, W, H);
  const closeEquip = createActionButton(W - 60, 50, 72, 36, 'Close', () => openMenu(null));
  scene.equipmentPanel.add([closeEquip.box, closeEquip.labelTxt, closeEquip.hit]);

  const openMenu = (panel) => {
    scene.statsPanel.setVisible(panel === 'stats');
    scene.inventoryPanel.setVisible(panel === 'inventory');
    scene.equipmentPanel.setVisible(panel === 'equipment');
    if (panel === 'inventory' && scene.refreshInventoryDisplay) {
      scene.refreshInventoryDisplay();
    }
    if (panel === 'stats' && scene.updateExpBar) {
      scene.updateExpBar();
    }
  };

  createNavButton(navCenters[0], Y_NAV, navBtnW, navBtnH, 'Stats', () => openMenu('stats'));
  createNavButton(navCenters[1], Y_NAV, navBtnW, navBtnH, 'Inv', () => openMenu('inventory'));
  createNavButton(navCenters[2], Y_NAV, navBtnW, navBtnH, 'Equip', () => openMenu('equipment'));
  createNavButton(navCenters[3], Y_NAV, navBtnW, navBtnH, 'Map', () => {
    scene.statsPanel.setVisible(false);
    scene.inventoryPanel.setVisible(false);
    scene.equipmentPanel.setVisible(false);
    scene.scene.start('OverworldMapScene', { from: fromSceneKey });
  });
}

function buildStatsPanel(scene, container, txt, W, H) {
  const player = getPlayer();
  const stats = player.stats;
  const fmt = (id) => {
    const s = stats[id];
    const level = s.current !== undefined ? `${s.current}/${s.level}` : s.level;
    return `${id.charAt(0).toUpperCase() + id.slice(1)}: ${level}`;
  };
  const bg = scene.add.graphics();
  bg.fillStyle(0x0a0a1a, 0.98);
  bg.fillRect(0, 0, W, H);
  container.add(bg);
  container.add(txt(W / 2, 24, 'Stats', 0xffffff, 14).setOrigin(0.5));
  const expBarY = 48;
  const expBarW = W - 32;
  const expBarH = 8;
  const expBarX = 16;
  const expBg = scene.add.graphics();
  expBg.fillStyle(0x222244, 1);
  expBg.fillRoundedRect(expBarX, expBarY - expBarH / 2, expBarW, expBarH, 2);
  expBg.lineStyle(1, 0x444466);
  expBg.strokeRoundedRect(expBarX, expBarY - expBarH / 2, expBarW, expBarH, 2);
  container.add(expBg);
  scene.statsExpFill = scene.add.graphics();
  container.add(scene.statsExpFill);
  scene.statsExpText = txt(W / 2, expBarY + 12, `XP: ${player.experience || 0}`, 0xaaaaff, 8);
  scene.statsExpText.setOrigin(0.5);
  container.add(scene.statsExpText);
  scene.updateExpBar = () => updateExpBar(scene);
  updateExpBar(scene);
  const colY = 76;
  const rowH = 20;
  container.add(txt(48, colY, 'Combat', 0xa0a0ff));
  ['attack', 'strength', 'defense', 'hitpoints', 'prayer', 'magic', 'ranged', 'agility'].forEach((id, i) => {
    container.add(txt(16, colY + 24 + i * rowH, fmt(id)));
  });
  container.add(txt(368, colY, 'Skills', 0xa0ffa0));
  ['cooking', 'fishing', 'mining', 'smithing', 'crafting', 'hunting'].forEach((id, i) => {
    container.add(txt(336, colY + 24 + i * rowH, fmt(id)));
  });
}

function updateExpBar(scene) {
  if (!scene.statsExpFill) return;
  const player = getPlayer();
  const exp = player.experience || 0;
  const expPerLevel = 100;
  const expInCurrentLevel = exp % expPerLevel;
  const expPercent = expInCurrentLevel / expPerLevel;
  const W = scene.gameW ?? scene.scale.width;
  const expBarW = W - 32;
  const expBarH = 8;
  const expBarX = 16;
  const expBarY = 48;
  const fillW = expBarW * expPercent;
  scene.statsExpFill.clear();
  scene.statsExpFill.fillStyle(0x6666ff, 1);
  scene.statsExpFill.fillRoundedRect(expBarX, expBarY - expBarH / 2, fillW, expBarH, 2);
  if (scene.statsExpText?.setText) scene.statsExpText.setText(`XP: ${exp}`);
}

function buildInventoryPanel(scene, container, txt, W, H) {
  const bg = scene.add.graphics();
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
  const left = (W - gridW) / 2 + slotSize / 2;
  const top = 88 + slotSize / 2;
  const stepX = slotSize + padding;
  const stepY = slotSize + padding;
  scene.inventorySlotContainers = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = left + col * stepX;
      const y = top + row * stepY;
      const slotContainer = scene.add.container(x, y);
      const g = scene.add.graphics();
      g.fillStyle(slotColor, 0.9);
      g.fillRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 8);
      g.lineStyle(1, slotBorder);
      g.strokeRoundedRect(-slotSize / 2, -slotSize / 2, slotSize, slotSize, 8);
      slotContainer.add(g);
      container.add(slotContainer);
      scene.inventorySlotContainers.push(slotContainer);
    }
  }
  scene.refreshInventoryDisplay = () => refreshInventoryDisplay(scene);
  refreshInventoryDisplay(scene);
}

function refreshInventoryDisplay(scene) {
  let slots = scene.inventorySlotContainers;
  if (!slots?.length && scene.inventoryPanel?.list?.length >= 50) {
    slots = scene.inventoryPanel.list.slice(2, 50);
    scene.inventorySlotContainers = slots;
  }
  if (!slots?.length) return;
  const player = getPlayer();
  const inventory = player.inventory || [];
  const hex = (n) => '#' + n.toString(16).padStart(6, '0');
  const makeText = (x, y, text, color, size) => {
    const t = scene.add.text(x, y, text, {
      fontSize: `${size}px`,
      fontFamily: '"Press Start 2P", monospace',
      color: hex(color)
    });
    t.setPadding(10, 6, 10, 6);
    return t;
  };
  for (let i = 0; i < slots.length; i++) {
    const slotContainer = slots[i];
    if (!slotContainer?.active) continue;
    while (slotContainer.length > 1) {
      const child = slotContainer.list[slotContainer.length - 1];
      slotContainer.removeAt(slotContainer.length - 1);
      if (child?.destroy) child.destroy();
    }
    const slot = inventory[i];
    if (slot?.itemId) {
      const itemData = ITEMS[slot.itemId];
      const name = itemData ? itemData.name : slot.itemId;
      const qty = slot.quantity || 1;
      const nameText = makeText(0, -24, name, 0xddddff, 8);
      nameText.setOrigin(0.5);
      nameText.setWordWrapWidth(58);
      slotContainer.add(nameText);
      slotContainer.add(createItemIcon(scene, slot.itemId));
      if (qty > 1) {
        const qtyText = makeText(0, 20, `(${qty})`, 0xeeeeff, 10);
        qtyText.setOrigin(0.5);
        slotContainer.add(qtyText);
      }
    }
  }
}

function buildEquipmentPanel(scene, container, txt, W, H) {
  const bg = scene.add.graphics();
  bg.fillStyle(0x0a0a1a, 0.98);
  bg.fillRect(0, 0, W, H);
  container.add(bg);
  container.add(txt(W / 2, 20, 'Equipment', 0xffffff, 14).setOrigin(0.5, 0));
  const slotSize = 72;
  const slotColor = 0x333355;
  const slotBorder = 0x555588;
  const rowH = 80;
  const addSlot = (x, y, label) => {
    const g = scene.add.graphics();
    g.fillStyle(slotColor, 0.9);
    g.fillRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 8);
    g.lineStyle(1, slotBorder);
    g.strokeRoundedRect(x - slotSize / 2, y - slotSize / 2, slotSize, slotSize, 8);
    container.add(g);
    container.add(txt(x, y, label, 0xccccdd, 10).setOrigin(0.5));
  };
  const cx = W / 2;
  const cyStart = 120;
  addSlot(cx, cyStart, 'Head');
  addSlot(cx, cyStart + rowH, 'Neck');
  addSlot(cx, cyStart + rowH * 2, 'Chest');
  addSlot(cx, cyStart + rowH * 3, 'Leg');
  addSlot(cx, cyStart + rowH * 4, 'Boot');
  addSlot(140, 160, 'Cape');
  addSlot(140, 160 + rowH, 'Weapon');
  addSlot(W - 140, 240, 'Shield');
}

