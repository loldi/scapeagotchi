import Phaser from 'phaser';
import { initGameState } from './state/gameState.js';
import GameScene from './scenes/GameScene.js';

initGameState();

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

// Base size for zoom (half of game size) so canvas scale is integer when zoom is even
const DISPLAY_BASE_WIDTH = 400;
const DISPLAY_BASE_HEIGHT = 300;

// Return even zoom so canvas scale (0.5 * zoom) is integer → crisp pixels when resized
function getIntegerZoom() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const zoomX = Math.floor(w / DISPLAY_BASE_WIDTH);
  const zoomY = Math.floor(h / DISPLAY_BASE_HEIGHT);
  const zoom = Math.max(2, Math.min(zoomX, zoomY));
  return zoom % 2 === 0 ? zoom : zoom - 1; // ensure even (2, 4, 6, …)
}

function applyScale() {
  const zoom = getIntegerZoom();
  const wrapper = document.getElementById('game-wrapper');
  if (wrapper) {
    wrapper.style.width = DISPLAY_BASE_WIDTH * zoom + 'px';
    wrapper.style.height = DISPLAY_BASE_HEIGHT * zoom + 'px';
  }
}

applyScale();

const config = {
  type: Phaser.AUTO,
  parent: 'game-wrapper',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  pixelArt: true,
  render: {
    antialias: false,
    roundPixels: true,
    pixelArt: true
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [GameScene],
  callbacks: {
    postBoot: (game) => {
      // Force crisp pixel scaling on the canvas (nearest-neighbor when browser scales it)
      const canvas = game.canvas;
      if (canvas && canvas.style) {
        canvas.style.imageRendering = 'pixelated';
        canvas.style.imageRendering = 'crisp-edges';
        canvas.style.msInterpolationMode = 'nearest-neighbor';
      }
      window.addEventListener('resize', () => {
        applyScale();
        game.scale.refresh();
      });
    }
  }
};

new Phaser.Game(config);
