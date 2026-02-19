/**
 * Loading scene: displays game title, loading bar, and Login button. Game starts only after Login is clicked.
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
    const title = this.add.text(W / 2, H / 2 - 80, 'SCAPEAGOTCHI', {
      fontSize: '32px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#eaeaea'
    });
    title.setOrigin(0.5);
    title.setAlign('center');
    title.setPadding(10, 6, 10, 6);

    // Loading bar background
    const barW = 280;
    const barH = 16;
    const barX = (W - barW) / 2;
    const barY = H / 2 - 20;
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

    // Load assets (base-aware for GitHub Pages)
    const base = import.meta.env.BASE_URL;
    this.load.bitmapFont(
      'minogram',
      base + 'assets/fonts/minogram_6x10.png',
      base + 'assets/fonts/minogram_6x10.xml'
    );
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Login button (must be clicked to start)
    const btnW = 160;
    const btnH = 48;
    const btnX = W / 2;
    const btnY = H / 2 + 50;
    const loginBox = this.add.graphics();
    const drawBtn = (hover = false) => {
      loginBox.clear();
      loginBox.fillStyle(hover ? 0x444466 : 0x333355, 0.95);
      loginBox.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
      loginBox.lineStyle(2, hover ? 0x8888cc : 0x555588);
      loginBox.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 6);
    };
    drawBtn();
    this.add.existing(loginBox);

    const loginText = this.add.text(btnX, btnY, 'Login', {
      fontSize: '18px',
      fontFamily: '"Press Start 2P", monospace',
      color: '#eaeaea'
    });
    loginText.setOrigin(0.5);
    loginText.setPadding(10, 6, 10, 6);
    this.add.existing(loginText);

    const loginHit = this.add.rectangle(btnX, btnY, btnW, btnH);
    loginHit.setInteractive({ useHandCursor: true });
    loginHit.on('pointerover', () => drawBtn(true));
    loginHit.on('pointerout', () => drawBtn(false));
    loginHit.on('pointerdown', () => {
      this.scene.start('NoobsHouseScene');
    });
    this.add.existing(loginHit);
  }
}
