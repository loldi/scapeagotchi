/**
 * Loading scene: displays game title, loading bar, and Login/Continue button. Game starts only after click.
 */

import { initGameState } from '../state/gameState.js';
import { loadGame, hasSave, clearSave } from '../state/save.js';

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

    const btnLabel = hasSave() ? 'Continue' : 'Login';
    const loginText = this.add.text(btnX, btnY, btnLabel, {
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
    const startGame = (useSave) => {
      if (useSave) {
        const saved = loadGame();
        if (saved?.player) {
          initGameState(saved.player);
          const sceneKey = saved.lastScene || 'OverworldMapScene';
          const validScenes = ['NoobsHouseScene', 'OverworldMapScene', 'GameScene', 'MinesScene', 'CastleScene'];
          if (validScenes.includes(sceneKey)) {
            this.scene.start(sceneKey);
          } else {
            this.scene.start('OverworldMapScene', { from: 'NoobsHouseScene' });
          }
          return;
        }
      }
      clearSave();
      initGameState();
      this.scene.start('NoobsHouseScene');
    };
    loginHit.on('pointerdown', () => startGame(true));

    if (hasSave()) {
      const newGameY = btnY + 60;
      const newBox = this.add.graphics();
      const drawNewBtn = (hover = false) => {
        newBox.clear();
        newBox.fillStyle(hover ? 0x444466 : 0x333355, 0.95);
        newBox.fillRoundedRect(btnX - btnW / 2, newGameY - btnH / 2, btnW, btnH, 6);
        newBox.lineStyle(2, hover ? 0x8888cc : 0x555588);
        newBox.strokeRoundedRect(btnX - btnW / 2, newGameY - btnH / 2, btnW, btnH, 6);
      };
      drawNewBtn();
      this.add.existing(newBox);
      this.add.text(btnX, newGameY, 'New Game', {
        fontSize: '18px',
        fontFamily: '"Press Start 2P", monospace',
        color: '#eaeaea'
      }).setOrigin(0.5).setPadding(10, 6, 10, 6);
      const newHit = this.add.rectangle(btnX, newGameY, btnW, btnH);
      newHit.setInteractive({ useHandCursor: true });
      newHit.on('pointerover', () => drawNewBtn(true));
      newHit.on('pointerout', () => drawNewBtn(false));
      newHit.on('pointerdown', () => startGame(false));
    }
  }
}
