export default class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    // Background
    this.add.image(400, 300, 'background');

    // Title
    this.add.text(400, 100, 'PENGUIN NET CATCHER', {
      fontSize: '36px', fill: '#ffff44',
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(400, 148, 'catch the blue cobras!', {
      fontSize: '18px', fill: '#aaffaa', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Penguin preview
    this.add.image(280, 300, 'penguin').setScale(2);

    // Cobra preview
    this.add.image(520, 300, 'cobra').setScale(2);

    // VS text
    this.add.text(400, 300, 'VS', {
      fontSize: '28px', fill: '#ff4444', fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Instructions
    const instLines = [
      'Hold MOUSE + drag to aim (slingshot)',
      'Press SPACE to fire the net',
      'Catch cobras before they escape!',
      'Boss every 5 levels — earn extra hearts!'
    ];
    instLines.forEach((line, i) => {
      this.add.text(400, 390 + i * 24, line, {
        fontSize: '13px', fill: '#ccffcc', fontFamily: 'monospace'
      }).setOrigin(0.5);
    });

    // High score
    const hs = parseInt(localStorage.getItem('pnc-highscore') || '0');
    this.add.text(400, 500, `High Score: ${hs}`, {
      fontSize: '18px', fill: '#ffdd44', fontFamily: 'monospace'
    }).setOrigin(0.5);

    // Blinking start prompt
    const startText = this.add.text(400, 545, 'Press ENTER or CLICK to start', {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    this.tweens.add({ targets: startText, alpha: 0, duration: 600, yoyo: true, repeat: -1 });

    // Input
    this.input.keyboard.once('keydown-ENTER', () => this._start());
    this.input.once('pointerdown', () => this._start());
  }

  _start() {
    this.cameras.main.fade(400, 0, 0, 0);
    this.time.delayedCall(400, () => {
      this.scene.start('Game', {
        levelMgr: null, scoreMgr: null, heartMgr: null
      });
    });
  }
}
