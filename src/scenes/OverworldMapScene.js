/**
 * Overworld map: Castle → House → Mines (branch) → Coop, connected by paths.
 * Uses Phaser Text with setPadding to avoid BitmapText cropping.
 */

import { setCurrentScene, saveGame } from '../state/save.js';

export default class OverworldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldMapScene' });
  }

  create(data = {}) {
    setCurrentScene('OverworldMapScene');
    saveGame();
    const fromScene = data.from || 'NoobsHouseScene';
    const W = this.scale.width;
    const H = this.scale.height;
    const centerX = W / 2;

    const txt = (x, y, text, color = '#eaeaea', fontSize = 10) => {
      const t = this.add.text(x, y, text, {
        fontSize: `${fontSize}px`,
        fontFamily: '"Press Start 2P", monospace',
        color
      });
      t.setOrigin(0.5);
      t.setPadding(10, 6, 10, 6);
      return t;
    };

    // --- Background: map parchment / grassy field ---
    const bg = this.add.graphics();
    bg.fillStyle(0x3d4a32, 1);
    bg.fillRect(0, 0, W, H);
    bg.fillStyle(0x4a5d3a, 0.9);
    bg.fillRoundedRect(24, 60, W - 48, H - 120, 12);
    bg.lineStyle(4, 0x5d6b44);
    bg.strokeRoundedRect(24, 60, W - 48, H - 120, 12);

    // Title
    txt(centerX, 35, 'Where to?', '#eaeacc', 12);

    // --- Location positions: Castle → House → Mines (branch up) → Coop ---
    const castleX = 140;
    const houseX = 280;
    const minesX = 480;
    const minesY = 240;  // Above main path, reached by branch
    const coopX = W - 140;
    const groundY = 320;
    const buildingBaseY = groundY - 20;

    // --- Main path + branch to Mines ---
    const pathG = this.add.graphics();
    pathG.fillStyle(0x8b7355, 0.95);
    pathG.lineStyle(2, 0x6b5344);
    // Main ribbon: Castle → House → junction → Coop
    pathG.beginPath();
    pathG.moveTo(castleX + 35, groundY + 12);
    pathG.lineTo(240, groundY + 48);
    pathG.lineTo(houseX - 15, groundY + 38);
    pathG.lineTo(houseX + 30, groundY + 50);
    pathG.lineTo(420, groundY + 52);   // junction before Mines
    pathG.lineTo(580, groundY + 48);
    pathG.lineTo(coopX - 35, groundY + 12);
    pathG.lineTo(coopX - 35, groundY + 48);
    pathG.lineTo(580, groundY + 42);
    pathG.lineTo(420, groundY + 48);
    pathG.lineTo(houseX + 30, groundY + 58);
    pathG.lineTo(houseX - 15, groundY + 48);
    pathG.lineTo(240, groundY + 42);
    pathG.lineTo(castleX + 35, groundY + 48);
    pathG.closePath();
    pathG.fillPath();
    pathG.strokePath();
    // Branch path up to Mines (curving strip from main path)
    pathG.beginPath();
    pathG.moveTo(405, groundY + 40);
    pathG.lineTo(455, groundY + 25);
    pathG.lineTo(minesX - 5, minesY + 50);
    pathG.lineTo(minesX + 15, minesY + 52);
    pathG.lineTo(460, groundY + 55);
    pathG.lineTo(410, groundY + 48);
    pathG.closePath();
    pathG.fillPath();
    pathG.strokePath();

    // --- Castle (left): blocky towers and walls ---
    const drawCastle = (x, y, scale = 1) => {
      const g = this.add.graphics();
      const s = scale;
      // Base / walls
      g.fillStyle(0x888899, 1);
      g.fillRect(x - 35 * s, y - 20 * s, 70 * s, 55 * s);
      g.lineStyle(1, 0x6a6a7a);
      g.strokeRect(x - 35 * s, y - 20 * s, 70 * s, 55 * s);
      // Left tower
      g.fillStyle(0x9999aa, 1);
      g.fillRect(x - 32 * s, y - 55 * s, 22 * s, 40 * s);
      g.fillStyle(0x6b5344, 1);
      g.fillRect(x - 28 * s, y - 60 * s, 14 * s, 8 * s);
      // Right tower
      g.fillStyle(0x9999aa, 1);
      g.fillRect(x + 10 * s, y - 55 * s, 22 * s, 40 * s);
      g.fillStyle(0x6b5344, 1);
      g.fillRect(x + 14 * s, y - 60 * s, 14 * s, 8 * s);
      // Center arch
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(x - 12 * s, y, 24 * s, 35 * s);
      return g;
    };
    const castleG = drawCastle(castleX, buildingBaseY, 1);
    this.add.existing(castleG);
    const castleLabel = txt(castleX, groundY + 50, 'Castle', '#ddddbb', 8);
    this.add.existing(castleLabel);

    // --- House (center): gable roof, door, window ---
    const drawHouse = (x, y, scale = 1) => {
      const g = this.add.graphics();
      const s = scale;
      // Roof (gable)
      g.fillStyle(0x6b5344, 1);
      g.fillTriangle(x - 28 * s, y - 15 * s, x, y - 45 * s, x + 28 * s, y - 15 * s);
      g.lineStyle(1, 0x5d4a3a);
      g.strokeTriangle(x - 28 * s, y - 15 * s, x, y - 45 * s, x + 28 * s, y - 15 * s);
      // Body
      g.fillStyle(0xc4a574, 1);
      g.fillRect(x - 28 * s, y - 15 * s, 56 * s, 50 * s);
      g.lineStyle(1, 0xa08050);
      g.strokeRect(x - 28 * s, y - 15 * s, 56 * s, 50 * s);
      // Door
      g.fillStyle(0x6b5344, 1);
      g.fillRect(x - 8 * s, y + 15 * s, 16 * s, 20 * s);
      // Window
      g.fillStyle(0x5588aa, 0.8);
      g.fillRect(x + 10 * s, y - 5 * s, 12 * s, 10 * s);
      return g;
    };
    const houseG = drawHouse(houseX, buildingBaseY, 1);
    this.add.existing(houseG);
    const houseLabel = txt(houseX, groundY + 50, 'House', '#ddddbb', 8);
    this.add.existing(houseLabel);

    // --- Mines (branch path): dome on shaft with entrance ---
    const drawMines = (x, y, scale = 1) => {
      const g = this.add.graphics();
      const s = scale;
      // Shaft (narrow vertical structure, mine entrance)
      g.fillStyle(0x6b5344, 1);
      g.fillRect(x - 12 * s, y + 20 * s, 24 * s, 45 * s);
      g.lineStyle(1, 0x5d4a3a);
      g.strokeRect(x - 12 * s, y + 20 * s, 24 * s, 45 * s);
      // Dome / mushroom cap on top
      g.fillStyle(0x8b7355, 1);
      g.fillEllipse(x, y - 5 * s, 50 * s, 30 * s);
      g.lineStyle(2, 0x6b5344);
      g.strokeEllipse(x, y - 5 * s, 50 * s, 30 * s);
      // Rectangular opening on front of dome
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(x - 10 * s, y - 18 * s, 20 * s, 14 * s);
      return g;
    };
    const minesG = drawMines(minesX, minesY, 1);
    this.add.existing(minesG);
    const minesLabel = txt(minesX, minesY + 90, 'Mines', '#ddddbb', 8);
    this.add.existing(minesLabel);

    // --- Coop (right): rectangular with rounded roof, chicken ---
    const drawCoop = (x, y, scale = 1) => {
      const g = this.add.graphics();
      const s = scale;
      // Main building (rectangular)
      g.fillStyle(0xb8956a, 1);
      g.fillRect(x - 40 * s, y - 25 * s, 80 * s, 60 * s);
      g.lineStyle(2, 0x8b7355);
      g.strokeRect(x - 40 * s, y - 25 * s, 80 * s, 60 * s);
      // Rounded roof
      g.fillStyle(0x6b5344, 1);
      g.fillEllipse(x, y - 28 * s, 75 * s, 14 * s);
      // Door / opening
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(x - 15 * s, y + 15 * s, 30 * s, 25 * s);
      // Chicken (small oval + head)
      g.fillStyle(0xffffff, 1);
      g.fillEllipse(x + 25 * s, y - 35 * s, 10 * s, 8 * s);
      g.fillStyle(0xffdd88, 1);
      g.fillCircle(x + 32 * s, y - 38 * s, 4 * s);
      return g;
    };
    const coopG = drawCoop(coopX, buildingBaseY, 1);
    this.add.existing(coopG);
    const coopLabel = txt(coopX, groundY + 50, 'Coop', '#ddddbb', 8);
    this.add.existing(coopLabel);

    // --- Clickable areas ---
    const makeLocation = (x, y, w, h, scene) => {
      const hit = this.add.rectangle(x, y, w, h);
      hit.setInteractive({ useHandCursor: true });
      hit.on('pointerdown', () => this.scene.start(scene));
      return hit;
    };

    // Castle -> CastleScene
    const castleHit = makeLocation(castleX, buildingBaseY - 15, 90, 90, 'CastleScene');
    this.add.existing(castleHit);

    // Mines -> MinesScene
    const minesHit = makeLocation(minesX, minesY + 25, 70, 100, 'MinesScene');
    this.add.existing(minesHit);

    // House -> NoobsHouseScene
    const houseHit = makeLocation(houseX, buildingBaseY - 15, 100, 110, 'NoobsHouseScene');
    this.add.existing(houseHit);

    // Coop -> GameScene
    const coopHit = makeLocation(coopX, buildingBaseY - 15, 120, 110, 'GameScene');
    this.add.existing(coopHit);

    // Back button
    const backY = H - 55;
    const backBox = this.add.graphics();
    backBox.fillStyle(0x333355, 0.9);
    backBox.fillRoundedRect(centerX - 70, backY - 18, 140, 36, 4);
    backBox.lineStyle(1, 0x555588);
    backBox.strokeRoundedRect(centerX - 70, backY - 18, 140, 36, 4);
    this.add.existing(backBox);
    txt(centerX, backY, 'Back', '#aaaadd', 10);
    const backHit = this.add.rectangle(centerX, backY, 140, 36);
    backHit.setInteractive({ useHandCursor: true });
    backHit.on('pointerdown', () => this.scene.start(fromScene));
    this.add.existing(backHit);
  }
}
