/**
 * Overworld map: graphical layout with Castle → House → Coop, connected by paths.
 * Uses Phaser Text with setPadding to avoid BitmapText cropping.
 */

export default class OverworldMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'OverworldMapScene' });
  }

  create(data = {}) {
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

    // --- Location positions: Castle (left) → House (center) → Coop (right) ---
    const castleX = 160;
    const houseX = centerX;
    const coopX = W - 160;
    const groundY = 320;
    const buildingBaseY = groundY - 20;

    // --- Winding path (dirt road) - ribbon connecting Castle → House → Coop ---
    const pathG = this.add.graphics();
    pathG.fillStyle(0x8b7355, 0.95);
    pathG.lineStyle(2, 0x6b5344);
    pathG.beginPath();
    // Top edge (winds downward toward center)
    pathG.moveTo(castleX + 35, groundY + 12);
    pathG.lineTo(300, groundY + 50);
    pathG.lineTo(houseX - 20, groundY + 35);
    pathG.lineTo(houseX + 20, groundY + 48);
    pathG.lineTo(500, groundY + 50);
    pathG.lineTo(coopX - 35, groundY + 12);
    // Bottom edge (wider, winds back)
    pathG.lineTo(coopX - 35, groundY + 48);
    pathG.lineTo(500, groundY + 42);
    pathG.lineTo(houseX + 20, groundY + 62);
    pathG.lineTo(houseX - 20, groundY + 55);
    pathG.lineTo(300, groundY + 42);
    pathG.lineTo(castleX + 35, groundY + 48);
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

    // Castle: "Coming soon" - show tooltip, not clickable for now
    const castleHit = this.add.rectangle(castleX, buildingBaseY - 15, 90, 90);
    castleHit.setInteractive({ useHandCursor: false });
    const castleTooltip = txt(castleX, groundY + 80, 'Coming soon', '#888866', 6);
    castleTooltip.setVisible(false);
    castleHit.on('pointerover', () => castleTooltip.setVisible(true));
    castleHit.on('pointerout', () => castleTooltip.setVisible(false));
    this.add.existing(castleHit);
    this.add.existing(castleTooltip);

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
