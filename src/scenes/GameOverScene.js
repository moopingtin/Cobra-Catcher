export default class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) { this.scoreMgr = data.scoreMgr; }

  create() {
    this._gorillaUnlocked = false;
    this._codeMode = false;
    this._codeProgress = 0;
    this._overlayItems = [];

    this.add.image(400, 300, 'background');

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, 800, 600);

    this.add.text(400, 140, 'GAME OVER', {
      fontSize: '52px', fill: '#ff2244',
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);

    const score = this.scoreMgr ? this.scoreMgr.score : 0;
    const hs    = this.scoreMgr ? this.scoreMgr.highScore
                                : parseInt(localStorage.getItem('pnc-highscore') || '0');

    this.add.text(400, 240, `Final Score: ${score}`, {
      fontSize: '28px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(0.5);

    if (score >= hs && score > 0) {
      this.add.text(400, 285, 'NEW HIGH SCORE!', {
        fontSize: '22px', fill: '#ffdd00',
        fontFamily: 'monospace', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
    } else {
      this.add.text(400, 285, `High Score: ${hs}`, {
        fontSize: '20px', fill: '#ffdd44', fontFamily: 'monospace'
      }).setOrigin(0.5);
    }

    this.add.image(400, 390, 'penguin').setFlipY(true).setScale(1.5).setAlpha(0.8);

    this._playBtn = this.add.text(400, 498, '[ Play Again ]', {
      fontSize: '22px', fill: '#44ff88',
      fontFamily: 'monospace', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this._playBtn.on('pointerover', () => { if (!this._gorillaUnlocked) this._playBtn.setStyle({ fill: '#88ffaa' }); });
    this._playBtn.on('pointerout',  () => { if (!this._gorillaUnlocked) this._playBtn.setStyle({ fill: '#44ff88' }); });
    this._playBtn.on('pointerdown', () => this._restart());

    // ── Secret code hint in bottom-left ───────────────────────────────────
    // Big "16NO" label above the boxes — click it to enter code mode
    const codeLabel = this.add.text(12, 530, '16NO', {
      fontSize: '26px', fill: '#ffdd00',
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 3
    }).setInteractive({ useHandCursor: true });
    codeLabel.on('pointerover', () => codeLabel.setStyle({ fill: '#ffffff' }));
    codeLabel.on('pointerout',  () => codeLabel.setStyle({ fill: '#ffdd00' }));
    codeLabel.on('pointerdown', () => this._enterCodeMode());

    // 4 small indicator boxes below the label
    this._smallBoxes = [];
    for (let i = 0; i < 4; i++) {
      const b = this.add.graphics();
      b.fillStyle(0x333333); b.fillRect(12 + i * 19, 562, 15, 15);
      this._smallBoxes.push(b);
    }

    // ── Keyboard: restart (blocked while in code mode) ─────────────────────
    this.input.keyboard.on('keydown-ENTER', () => { if (!this._codeMode) this._restart(); });
    this.input.keyboard.on('keydown-SPACE', () => { if (!this._codeMode) this._restart(); });
    this.input.keyboard.on('keydown-R',     () => { if (!this._codeMode) this._restart(); });
    this.input.keyboard.on('keydown-ESC',   () => { if (this._codeMode)  this._exitCodeMode(); });
  }

  // ── Code entry mode ────────────────────────────────────────────────────────

  _enterCodeMode() {
    if (this._codeMode || this._gorillaUnlocked) return;
    this._codeMode = true;
    this._codeProgress = 0;
    this._overlayItems = [];

    // Full white overlay — wipes out everything behind it
    const white = this.add.graphics().setDepth(40);
    white.fillStyle(0xffffff, 1);
    white.fillRect(0, 0, 800, 600);
    white.setAlpha(0);
    this.tweens.add({ targets: white, alpha: 1, duration: 280 });
    this._overlayItems.push(white);

    // "ENTER SECRET CODE" title
    const title = this.add.text(400, 188, 'ENTER SECRET CODE', {
      fontSize: '30px', fill: '#222222', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(41).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 280 });
    this._overlayItems.push(title);

    // "16NO" hint just below title
    const hint = this.add.text(400, 240, '16NO', {
      fontSize: '22px', fill: '#888888', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(41).setAlpha(0);
    this.tweens.add({ targets: hint, alpha: 1, duration: 280 });
    this._overlayItems.push(hint);

    // 4 large gray boxes centered on screen
    // total width: 4*64 + 3*16 = 304 → startX = 400 - 152 = 248
    this._bigBoxData = [];
    const chars  = ['1', '6', 'N', 'O'];
    for (let i = 0; i < 4; i++) {
      const bx = 248 + i * 80, by = 280;
      const bg = this.add.graphics().setDepth(41).setAlpha(0);
      bg.fillStyle(0xbbbbbb); bg.fillRect(bx, by, 64, 64);
      this.tweens.add({ targets: bg, alpha: 1, duration: 280 });

      const lbl = this.add.text(bx + 32, by + 32, '', {
        fontSize: '34px', fill: '#111111', fontFamily: 'monospace'
      }).setOrigin(0.5).setDepth(42);

      this._overlayItems.push(bg, lbl);
      this._bigBoxData.push({ bg, lbl, bx, by, char: chars[i] });
    }

    // "ESC to cancel" hint
    const cancel = this.add.text(400, 392, 'Press ESC to cancel', {
      fontSize: '13px', fill: '#aaaaaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(41).setAlpha(0);
    this.tweens.add({ targets: cancel, alpha: 1, duration: 280 });
    this._overlayItems.push(cancel);

    // Keyboard handler for the code sequence
    this._codeListener = (evt) => this._handleCodeKey(evt);
    this.input.keyboard.on('keydown', this._codeListener);
  }

  _handleCodeKey(evt) {
    if (evt.key === 'Escape') { this._exitCodeMode(); return; }
    // Ignore non-character keys (Enter, arrows, backspace…)
    if (evt.key.length > 1) return;

    const CODE = ['1', '6', 'n', 'o'];
    const key  = evt.key.toLowerCase();

    if (key === CODE[this._codeProgress]) {
      // Correct key — light up the box
      const d = this._bigBoxData[this._codeProgress];
      d.bg.clear();
      d.bg.fillStyle(0xffdd00); d.bg.fillRect(d.bx, d.by, 64, 64);
      d.lbl.setText(evt.key.toUpperCase());
      this._codeProgress++;

      if (this._codeProgress === CODE.length) {
        this._unlockGorilla();
      }
    } else if (this._codeProgress > 0) {
      // Wrong key — flash red, reset
      this._bigBoxData.forEach(d => {
        d.bg.clear(); d.bg.fillStyle(0xff2200); d.bg.fillRect(d.bx, d.by, 64, 64);
        d.lbl.setText('');
      });
      this._codeProgress = 0;
      this.time.delayedCall(300, () => {
        this._bigBoxData.forEach(d => {
          d.bg.clear(); d.bg.fillStyle(0xbbbbbb); d.bg.fillRect(d.bx, d.by, 64, 64);
        });
      });
    }
  }

  _unlockGorilla() {
    this._gorillaUnlocked = true;

    // All boxes → green flash
    this._bigBoxData.forEach(d => {
      d.bg.clear(); d.bg.fillStyle(0x00ff44); d.bg.fillRect(d.bx, d.by, 64, 64);
    });

    // Dismiss overlay after a moment, reveal updated button
    this.time.delayedCall(700, () => {
      this._exitCodeMode();
      // Update small indicator boxes to green
      this._smallBoxes.forEach((b, i) => {
        b.clear(); b.fillStyle(0x00ff44); b.fillRect(12 + i * 19, 562, 15, 15);
      });
      // Transform play button
      this._playBtn.setText('[ GORILLA FIGHT! ]');
      this._playBtn.setStyle({ fill: '#ff4400', stroke: '#ffdd00', strokeThickness: 3 });
      this.tweens.add({
        targets: this._playBtn, scaleX: 1.08, scaleY: 1.08,
        duration: 380, yoyo: true, repeat: -1
      });
    });
  }

  _exitCodeMode() {
    if (!this._codeMode) return;
    this._codeMode = false;
    this.input.keyboard.off('keydown', this._codeListener);

    this.tweens.add({
      targets: this._overlayItems, alpha: 0, duration: 240,
      onComplete: () => { this._overlayItems.forEach(o => o.destroy()); this._overlayItems = []; }
    });
  }

  _restart() {
    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      if (this._gorillaUnlocked) {
        this.scene.start('GorillaBoss', { levelMgr: null, scoreMgr: null, heartMgr: null });
      } else {
        this.scene.start('Game', { levelMgr: null, scoreMgr: null, heartMgr: null });
      }
    });
  }
}
