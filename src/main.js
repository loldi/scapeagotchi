import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 320,
  height: 240,
  pixelArt: true,
  zoom: 2,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: {
    preload,
    create,
    update
  }
};

function preload() {
  // Placeholder for future assets
}

function create() {
  this.add.text(160, 120, 'Scapeagotchi', {
    fontSize: 16,
    color: '#eaeaea'
  }).setOrigin(0.5);
}

function update() {}

new Phaser.Game(config);
