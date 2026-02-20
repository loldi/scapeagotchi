/**
 * Starting area: simple room where new players spawn. Leave to go to Lumby Coop.
 */

import { setupPlayerUI } from '../ui/playerPanels.js';
import { setCurrentScene, saveGame } from '../state/save.js';

export default class NoobsHouseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NoobsHouseScene' });
  }

  create() {
    setCurrentScene('NoobsHouseScene');
    saveGame();
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;
    const Y_TOP = 40;
    const Y_GROUND = 370;
    const Y_CHAR = Y_GROUND - 78;
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

    // --- Background: simple room interior ---
    const bg = this.add.container(0, 0);
    bg.setDepth(-100);

    // Back wall (plaster/cream)
    const wallG = this.add.graphics();
    wallG.fillStyle(0xe8e0d0, 1);
    wallG.fillRect(0, 0, W, Y_GROUND + 50);
    wallG.fillStyle(0xd8d0c0, 0.4);
    wallG.fillRect(0, 0, W, 80);
    bg.add(wallG);

    // Wooden floor (planks)
    const floorG = this.add.graphics();
    floorG.fillStyle(0x8b7355, 1);
    floorG.fillRect(0, Y_GROUND - 20, W, H - Y_GROUND + 40);
    floorG.lineStyle(2, 0x6b5344);
    for (let i = 0; i < 14; i++) {
      floorG.lineBetween(i * 60, Y_GROUND - 20, i * 60, H);
    }
    bg.add(floorG);

    // Bed (left side): frame, headboard, mattress, pillow
    const bedX = 140;
    const bedY = Y_GROUND - 30;
    const bedG = this.add.graphics();
    bedG.fillStyle(0x6b5344, 1);
    bedG.fillRect(bedX - 70, bedY - 25, 140, 50);
    bedG.fillStyle(0x8b7355, 1);
    bedG.fillRect(bedX - 65, bedY - 22, 130, 44);
    bedG.fillStyle(0xd4a574, 0.9);
    bedG.fillRoundedRect(bedX - 60, bedY - 18, 120, 36, 4);
    bedG.fillStyle(0xe8e0d0, 1);
    bedG.fillRoundedRect(bedX - 50, bedY - 14, 40, 20, 3);
    bedG.fillStyle(0x5d4a3a, 1);
    bedG.fillRect(bedX - 72, bedY - 55, 8, 60);
    bedG.fillRect(bedX + 64, bedY - 55, 8, 60);
    bedG.fillRect(bedX - 72, bedY - 55, 144, 8);
    bg.add(bedG);

    // Table + chair (right side)
    const tableX = W - 160;
    const tableY = Y_GROUND - 40;
    const tableG = this.add.graphics();
    tableG.fillStyle(0x6b5344, 1);
    tableG.fillRect(tableX - 50, tableY - 5, 100, 12);
    tableG.fillRect(tableX - 45, tableY + 7, 8, 50);
    tableG.fillRect(tableX + 37, tableY + 7, 8, 50);
    tableG.fillStyle(0x8b7355, 0.9);
    tableG.fillRect(tableX - 48, tableY - 3, 96, 8);
    // Table items: bottle, fish/shape
    tableG.fillStyle(0x5588aa, 0.9);
    tableG.fillRoundedRect(tableX - 25, tableY - 18, 12, 18, 2);
    tableG.fillStyle(0xcc9966, 1);
    tableG.fillEllipse(tableX + 15, tableY - 10, 18, 8);
    bg.add(tableG);

    // Chair
    const chairG = this.add.graphics();
    chairG.fillStyle(0x6b5344, 1);
    chairG.fillRect(tableX - 70, tableY + 20, 35, 8);
    chairG.fillRect(tableX - 68, tableY - 25, 8, 55);
    chairG.fillStyle(0x8b7355, 0.9);
    chairG.fillRect(tableX - 68, tableY + 18, 31, 6);
    chairG.fillRoundedRect(tableX - 66, tableY - 30, 28, 12, 2);
    bg.add(chairG);

    // Door (right side, exit to Lumby Coop)
    const doorX = W - 80;
    const doorY = Y_GROUND - 100;
    const doorG = this.add.graphics();
    doorG.fillStyle(0x6b5344, 1);
    doorG.fillRect(doorX - 30, doorY - 90, 60, 100);
    doorG.fillStyle(0x8b7355, 0.95);
    doorG.fillRect(doorX - 26, doorY - 86, 52, 92);
    doorG.lineStyle(2, 0x5d4a3a);
    doorG.strokeRect(doorX - 26, doorY - 86, 52, 92);
    doorG.fillStyle(0x4a3a2a, 1);
    doorG.fillCircle(doorX + 18, doorY - 40, 4);
    bg.add(doorG);

    // Door hit area (click to leave) — shows overworld map
    const goToMap = () => {
      this.tweens.killAll();
      this.time.delayedCall(50, () => {
        this.scene.start('OverworldMapScene', { from: 'NoobsHouseScene' });
      });
    };
    const doorHit = this.add.rectangle(doorX, doorY - 40, 60, 100);
    doorHit.setInteractive({ useHandCursor: true });
    doorHit.setDepth(100);
    doorHit.on('pointerdown', goToMap);
    this.add.existing(doorHit);

    // Tooltip on door hover
    const tooltip = txt(doorX, doorY + 25, 'Leave', 0xaaaadd, 8);
    tooltip.setOrigin(0.5);
    tooltip.setDepth(101);
    tooltip.setVisible(false);
    doorHit.on('pointerover', () => tooltip.setVisible(true));
    doorHit.on('pointerout', () => tooltip.setVisible(false));
    this.add.existing(tooltip);

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
    this.locationLabel = txt(centerX, Y_TOP + 6, 'Noobs House', 0xccccdd, 10);
    this.locationLabel.setOrigin(0.5, 0.5);
    this.locationLabel.setDepth(500);
    this.add.existing(this.locationLabel);

    setupPlayerUI(this, 'NoobsHouseScene');
    this.gameW = W;

    // --- Player character (center) ---
    const scaperX = centerX;
    this.scaper = this.add.container(scaperX, Y_CHAR);
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

  shutdown() {
    this.tweens.killAll();
  }
}
