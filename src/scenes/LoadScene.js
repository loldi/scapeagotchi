/**
 * Loading scene: displays game title and loading bar, then starts GameScene.
 */

export default class LoadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadScene' });
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background (match game theme)
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1a, 1);
    bg.fillRect(0, 0, W, H);

    // Title
    const title = this.add.text(W / 2, H / 2 - 60, 'SCAPEAGOTCHI', {
      fontSize: '32px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#eaeaea'
    });
    title.setOrigin(0.5);
    title.setAlign('center');

    // Loading bar background
    const barW = 280;
    const barH = 16;
    const barX = (W - barW) / 2;
    const barY = H / 2 + 20;
    const barBg = this.add.graphics();
    barBg.fillStyle(0x222244, 0.9);
    barBg.fillRoundedRect(barX, barY, barW, barH, 4);
    barBg.lineStyle(2, 0x555588);
    barBg.strokeRoundedRect(barX, barY, barW, barH, 4);

    // Loading bar fill
    const barFill = this.add.graphics();
    this.load.on('progress', (value) => {
      barFill.clear();
      barFill.fillStyle(0x558855, 0.95);
      barFill.fillRoundedRect(barX + 3, barY + 3, (barW - 6) * value, barH - 6, 2);
    });

    // Load assets
    this.load.bitmapFont(
      'minogram',
      '/assets/fonts/minogram_6x10.png',
      '/assets/fonts/minogram_6x10.xml'
    );
  }

  create() {
    this.scene.start('GameScene');
  }
}
