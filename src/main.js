import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import BossScene from './scenes/BossScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import GorillaBossScene from './scenes/GorillaBossScene.js';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a3a1a',
  pixelArt: true,
  scene: [BootScene, MenuScene, GameScene, BossScene, GameOverScene, GorillaBossScene],
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  }
};

new Phaser.Game(config);
