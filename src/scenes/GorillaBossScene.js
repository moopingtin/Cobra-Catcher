export default class GorillaBossScene extends Phaser.Scene {
  constructor() { super('GorillaBoss'); }

  init(data) {
    // Allow fresh start (e.g. from Game Over secret code) or mid-game transition
    const { LevelManager, ScoreManager, HeartManager } = window._pncManagers || {};
    this.levelMgr = data.levelMgr || this._newLevelMgr();
    this.scoreMgr = data.scoreMgr || this._newScoreMgr();
    this.heartMgr = data.heartMgr || this._newHeartMgr();
  }

  _newLevelMgr() {
    return { level: 1, getBushCount: () => 6, getEscapeTime: () => 2.5, getSpawnInterval: () => 2600 };
  }
  _newScoreMgr() {
    return { score: 0, highScore: parseInt(localStorage.getItem('pnc-highscore') || '0'),
      add(n) { this.score += n; if (this.score > this.highScore) { this.highScore = this.score; localStorage.setItem('pnc-highscore', this.score); } }
    };
  }
  _newHeartMgr() {
    return { current: 3, max: 3,
      lose() { this.current = Math.max(0, this.current - 1); return this.current === 0; },
      gain() { this.current = Math.min(9, this.current + 1); }
    };
  }

  create() {
    this._setupAudio();
    this._buildBackground();

    this.nets = [];
    this.monkeys = [];
    this.coconuts = [];
    this.isDragging = false;
    this.dragStart = { x: 400, y: 320 };
    this.dragCurrent = { x: 400, y: 320 };
    this.penguinX = 400;
    this.penguinY = 320;
    this.phase = 'intro';
    this.gorillaHP = 10;
    this.gorillaMaxHP = 10;
    this.dodgePhasesDone = 0;
    this.defeated = false;
    this.DODGE_THRESHOLDS = [8, 5, 2];

    this._buildTrees();
    this._buildGorilla();
    this._buildPenguin();
    this._buildHUD();
    this._setupInput();

    // Intro
    this._showBanner('GORILLA BOSS!', 0xff2200, () => {
      this._showBanner('Catch monkeys to damage him!', 0xffdd44, () => {
        this.phase = 'monkey';
        this._startMonkeySpawning();
      });
    });
  }

  _setupAudio() {
    this._audioCtx = null;
    try { this._audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }

  playSound(type) {
    if (!this._audioCtx) return;
    const ctx = this._audioCtx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    switch(type) {
      case 'rustle':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);
        gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3); break;
      case 'hiss':
        osc.type = 'sine'; osc.frequency.setValueAtTime(500, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.3);
        gain.gain.setValueAtTime(0.18, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3); break;
      case 'whoosh':
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t); osc.stop(t + 0.2); break;
      case 'catch':
        osc.type = 'square'; osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
        gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t); osc.stop(t + 0.25); break;
      case 'heartlost':
        osc.type = 'square'; osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);
        gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t); osc.stop(t + 0.5); break;
      case 'roar':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(80, t);
        osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);
        gain.gain.setValueAtTime(0.5, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
        osc.start(t); osc.stop(t + 0.8); break;
      case 'thud':
        osc.type = 'sine'; osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.25);
        gain.gain.setValueAtTime(0.45, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t); osc.stop(t + 0.25); break;
      case 'victory':
        [300, 400, 500, 700, 900].forEach((freq, i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = 'square'; o2.frequency.value = freq;
          g2.gain.setValueAtTime(0.25, t + i * 0.1); g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.2);
          o2.start(t + i * 0.1); o2.stop(t + i * 0.1 + 0.25);
        }); break;
    }
  }

  _buildBackground() {
    this.add.image(400, 300, 'background').setDepth(0);
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x0a0a00, 0.4); g.fillRect(0, 0, 800, 600);
  }

  _buildTrees() {
    this.trees = [];
    const cx = 400, cy = 320;
    const rx = 235, ry = 185;
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * rx;
      const y = cy + Math.sin(angle) * ry;
      this.trees.push({
        x, y,
        sprite: this.add.image(x, y, 'tree').setDepth(3).setOrigin(0.5, 0.92),
        isActive: false
      });
    }
  }

  _buildGorilla() {
    this.gorillaSprite = this.add.image(400, 120, 'gorilla').setDepth(5);
    // Idle breathing
    this.tweens.add({
      targets: this.gorillaSprite,
      scaleY: 1.06,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    this.hpBg   = this.add.graphics().setDepth(9);
    this.hpFill = this.add.graphics().setDepth(9);
    this.hpLabel = this.add.text(400, 46, 'GORILLA', {
      fontSize: '13px', fill: '#ff4444', fontFamily: 'monospace'
    }).setOrigin(0.5, 1).setDepth(10);
    this._drawGorillaHP();
  }

  _drawGorillaHP() {
    const bx = 220, by = 48, bw = 360, bh = 16;
    this.hpBg.clear();   this.hpBg.fillStyle(0x333333);   this.hpBg.fillRect(bx, by, bw, bh);
    this.hpFill.clear();
    const frac = this.gorillaHP / this.gorillaMaxHP;
    this.hpFill.fillStyle(frac > 0.6 ? 0x00ff44 : frac > 0.3 ? 0xffaa00 : 0xff2200);
    this.hpFill.fillRect(bx, by, Math.floor(bw * frac), bh);
  }

  _buildPenguin() {
    this.penguin = this.add.image(400, 320, 'penguin').setDepth(6).setOrigin(0.5, 0.6);
    this.launcher = this.add.image(400, 320, 'launcher').setDepth(7).setOrigin(0.05, 0.5);
    this.aimGraphics = this.add.graphics().setDepth(8);
  }

  _buildHUD() {
    this.scoreText = this.add.text(780, 10, `Score: ${this.scoreMgr.score}`, {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(1, 0).setDepth(10);

    this.heartImages = [];
    this._buildHeartHUD();

    this.statusText = this.add.text(400, 570, '', {
      fontSize: '15px', fill: '#ffdd44', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(10);

    this.dodgeTimerText = this.add.text(400, 548, '', {
      fontSize: '20px', fill: '#ff4444', fontFamily: 'monospace', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(10);
  }

  _buildHeartHUD() {
    this.heartImages.forEach(h => h.destroy());
    this.heartImages = [];
    const max = Math.max(this.heartMgr.current, 3);
    for (let i = 0; i < Math.min(max, 9); i++) {
      this.heartImages.push(
        this.add.image(14 + i * 26, 14, i < this.heartMgr.current ? 'heart-full' : 'heart-empty')
          .setOrigin(0, 0).setDepth(10)
      );
    }
  }

  _setupInput() {
    this.input.on('pointerdown', (p) => {
      this.isDragging = true;
      this.dragStart = { x: p.x, y: p.y };
      this.dragCurrent = { x: p.x, y: p.y };
    });
    this.input.on('pointermove', (p) => {
      if (!this.isDragging) return;
      this.dragCurrent = { x: p.x, y: p.y };
      if (this.phase === 'monkey') this._updateLauncher();
    });
    this.input.on('pointerup', () => { this.isDragging = false; });
    this.input.keyboard.on('keydown-SPACE', () => { if (this.phase === 'monkey') this._fireNet(); });
    this.input.keyboard.on('keydown-R', () => { this.scene.start('Game', {}); });
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  _updateLauncher() {
    const dx = this.dragCurrent.x - this.dragStart.x;
    const dy = this.dragCurrent.y - this.dragStart.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) return;
    const angle = Math.atan2(-dy, -dx);
    this.launcher.setRotation(angle);
    this.aimGraphics.clear();
    this.aimGraphics.lineStyle(2, 0xffff00, 0.5);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(this.penguinX, this.penguinY);
    this.aimGraphics.lineTo(this.penguinX + Math.cos(angle) * 120, this.penguinY + Math.sin(angle) * 120);
    this.aimGraphics.strokePath();
    this.aimGraphics.lineStyle(2, 0xffaa44, 0.7);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(this.penguinX, this.penguinY);
    this.aimGraphics.lineTo(this.dragCurrent.x, this.dragCurrent.y);
    this.aimGraphics.strokePath();
  }

  _fireNet() {
    const dx = this.dragCurrent.x - this.dragStart.x;
    const dy = this.dragCurrent.y - this.dragStart.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) return;
    const angle = Math.atan2(-dy, -dx);
    const speed = 480;
    const sprite = this.physics.add.image(this.penguinX, this.penguinY, 'net').setDepth(8);
    sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.playSound('whoosh');
    const net = {
      sprite, alive: true,
      lifeTimer: this.time.delayedCall(1200, () => {
        net.alive = false; if (sprite.active) sprite.destroy();
      })
    };
    this.nets.push(net);
    this.aimGraphics.clear();
    this.isDragging = false;
  }

  _startMonkeySpawning() {
    if (this.phase !== 'monkey') return;
    this.statusText.setText(`Gorilla HP: ${this.gorillaHP} / ${this.gorillaMaxHP}  —  catch monkeys!`);
    this._scheduleMonkey();
  }

  _scheduleMonkey() {
    if (this.phase !== 'monkey' || this.defeated) return;
    const interval = Math.max(1400, 2600 - this.dodgePhasesDone * 200);
    this.monkeyTimer = this.time.delayedCall(interval, () => {
      this._spawnMonkey();
      this._scheduleMonkey();
    });
  }

  _spawnMonkey() {
    if (this.phase !== 'monkey' || this.defeated) return;
    const avail = this.trees.filter(t => !t.isActive);
    if (avail.length === 0) return;
    const tree = avail[Math.floor(Math.random() * avail.length)];
    tree.isActive = true;

    // Tree rustle
    this.tweens.add({
      targets: tree.sprite,
      x: { from: tree.x - 5, to: tree.x + 5 },
      duration: 80, yoyo: true, repeat: 4,
      onComplete: () => { tree.sprite.x = tree.x; }
    });
    this.playSound('rustle');

    this.time.delayedCall(600, () => {
      if (this.phase !== 'monkey' || this.defeated) { tree.isActive = false; return; }
      const escapeTime = Math.max(1.5, 2.5 - this.dodgePhasesDone * 0.15);
      const sprite = this.physics.add.image(tree.x, tree.y - 24, 'monkey').setDepth(4).setOrigin(0.5, 1);
      sprite.setScale(0.1);
      this.tweens.add({ targets: sprite, scaleX: 1, scaleY: 1, duration: 200, ease: 'Back.Out' });
      this.playSound('hiss');

      const timerBar = this.add.graphics().setDepth(5);
      const monkey = { tree, sprite, caught: false, escaped: false, escapeTime, timeLeft: escapeTime, timerBar };

      monkey.tickEvent = this.time.addEvent({
        delay: 100, repeat: Math.floor(escapeTime * 10) - 1,
        callback: () => {
          if (monkey.caught || monkey.escaped) return;
          monkey.timeLeft -= 0.1;
          this._drawMonkeyBar(monkey);
        }
      });
      monkey.escapeEvent = this.time.delayedCall(escapeTime * 1000, () => {
        if (!monkey.caught) this._monkeyEscape(monkey);
      });
      this._drawMonkeyBar(monkey);
      this.monkeys.push(monkey);
    });
  }

  _drawMonkeyBar(monkey) {
    const bx = monkey.sprite.x - 22, by = monkey.sprite.y - monkey.sprite.displayHeight - 38;
    monkey.timerBar.clear();
    monkey.timerBar.fillStyle(0x333333); monkey.timerBar.fillRect(bx, by, 44, 5);
    const frac = monkey.timeLeft / monkey.escapeTime;
    monkey.timerBar.fillStyle(frac > 0.5 ? 0x00ff44 : frac > 0.25 ? 0xffaa00 : 0xff2200);
    monkey.timerBar.fillRect(bx, by, Math.floor(44 * frac), 5);
  }

  _monkeyEscape(monkey) {
    monkey.escaped = true;
    monkey.tree.isActive = false;
    if (monkey.tickEvent) monkey.tickEvent.remove();
    if (monkey.escapeEvent) monkey.escapeEvent.remove();
    monkey.timerBar.destroy();
    this.monkeys = this.monkeys.filter(m => m !== monkey);
    this.tweens.add({
      targets: monkey.sprite,
      x: monkey.sprite.x + (Math.random() > 0.5 ? 180 : -180),
      y: monkey.sprite.y + 50, alpha: 0, duration: 500,
      onComplete: () => { if (monkey.sprite.active) monkey.sprite.destroy(); }
    });
    const dead = this.heartMgr.lose();
    this.playSound('heartlost');
    this._buildHeartHUD();
    this.cameras.main.shake(280, 0.012);
    if (dead) this._gameOver();
  }

  _catchMonkey(monkey) {
    monkey.caught = true;
    monkey.tree.isActive = false;
    if (monkey.tickEvent) monkey.tickEvent.remove();
    if (monkey.escapeEvent) monkey.escapeEvent.remove();
    monkey.timerBar.destroy();
    this.monkeys = this.monkeys.filter(m => m !== monkey);
    this.playSound('catch');
    this.scoreMgr.add(150);
    this.scoreText.setText(`Score: ${this.scoreMgr.score}`);

    this.tweens.add({
      targets: monkey.sprite, scaleX: 0, scaleY: 0, alpha: 0, duration: 250,
      onComplete: () => { if (monkey.sprite.active) monkey.sprite.destroy(); }
    });
    for (let i = 0; i < 5; i++) {
      const s = this.add.image(monkey.sprite.x, monkey.sprite.y - 20, 'star').setDepth(9);
      const a = (i / 5) * Math.PI * 2;
      this.tweens.add({
        targets: s, x: s.x + Math.cos(a) * 36, y: s.y + Math.sin(a) * 36,
        alpha: 0, scaleX: 0, scaleY: 0, duration: 380, onComplete: () => s.destroy()
      });
    }

    this.gorillaHP--;
    this._drawGorillaHP();

    // Gorilla flinch
    this.gorillaSprite.setTint(0xff6666);
    this.cameras.main.shake(100, 0.005);
    this.time.delayedCall(200, () => { if (!this.defeated) this.gorillaSprite.clearTint(); });

    if (this.gorillaHP <= 0) { this._gorillaDefeated(); return; }

    // Check if this HP value triggers a dodge phase
    const idx = this.DODGE_THRESHOLDS.indexOf(this.gorillaHP);
    if (idx !== -1 && idx >= this.dodgePhasesDone) {
      this.time.delayedCall(400, () => this._startDodgePhase());
    } else {
      this.statusText.setText(`Gorilla HP: ${this.gorillaHP} / ${this.gorillaMaxHP}  —  catch monkeys!`);
    }
  }

  _startDodgePhase() {
    if (this.phase === 'dodge' || this.defeated) return;
    this.phase = 'dodge';
    if (this.monkeyTimer) this.monkeyTimer.remove();

    // Clear remaining monkeys safely
    this.monkeys.forEach(m => {
      if (m.tickEvent) m.tickEvent.remove();
      if (m.escapeEvent) m.escapeEvent.remove();
      m.timerBar.destroy();
      m.tree.isActive = false;
      if (m.sprite.active) m.sprite.destroy();
    });
    this.monkeys = [];

    this.dodgePhasesDone++;
    this.playSound('roar');
    this.cameras.main.shake(400, 0.018);

    // Gorilla rage tint + bigger bounce
    this.gorillaSprite.setTint(0xff4444);
    this.tweens.killTweensOf(this.gorillaSprite);
    this.tweens.add({
      targets: this.gorillaSprite, y: 105, duration: 300, yoyo: true, repeat: -1, ease: 'Quad.InOut'
    });

    this._showBanner('DODGE!', 0xff2200);
    this.statusText.setText('Use ARROW KEYS to dodge coconuts!');

    let timeLeft = 6;
    this.dodgeTimerText.setText(`Dodge: ${timeLeft}s`);
    this.dodgeCountdown = this.time.addEvent({
      delay: 1000, repeat: 5,
      callback: () => {
        timeLeft--;
        this.dodgeTimerText.setText(timeLeft > 0 ? `Dodge: ${timeLeft}s` : 'Surviving!');
      }
    });

    // Spawn coconuts throughout the dodge phase
    const coconutsToThrow = 4 + this.dodgePhasesDone;
    for (let i = 0; i < coconutsToThrow; i++) {
      this.time.delayedCall(400 + i * (5600 / coconutsToThrow), () => {
        if (this.phase === 'dodge' && !this.defeated) this._throwCoconut();
      });
    }

    // End dodge phase
    this.time.delayedCall(6000, () => {
      if (this.phase === 'dodge' && !this.defeated) this._endDodgePhase();
    });
  }

  _throwCoconut() {
    const gx = this.gorillaSprite.x, gy = this.gorillaSprite.y + 50;
    const dx = this.penguinX - gx, dy = this.penguinY - gy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = 200 + this.dodgePhasesDone * 35;

    const sprite = this.physics.add.image(gx, gy, 'coconut').setDepth(7);
    sprite.setVelocity((dx / len) * speed, (dy / len) * speed);
    this.cameras.main.shake(70, 0.003);
    this.playSound('thud');

    const coconut = {
      sprite, alive: true,
      life: this.time.delayedCall(3000, () => {
        coconut.alive = false; if (sprite.active) sprite.destroy();
      })
    };
    this.coconuts.push(coconut);
  }

  _endDodgePhase() {
    this.phase = 'monkey';
    if (this.dodgeCountdown) this.dodgeCountdown.remove();
    this.dodgeTimerText.setText('');

    this.coconuts.forEach(c => {
      c.alive = false;
      if (c.life) c.life.remove();
      if (c.sprite.active) c.sprite.destroy();
    });
    this.coconuts = [];

    // Gorilla calm down
    this.gorillaSprite.clearTint();
    this.tweens.killTweensOf(this.gorillaSprite);
    this.tweens.add({
      targets: this.gorillaSprite, scaleY: 1.06, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut'
    });

    this._showBanner('Back to catching!', 0x44ff88);
    this.time.delayedCall(900, () => { if (!this.defeated) this._startMonkeySpawning(); });
  }

  _gorillaDefeated() {
    if (this.defeated) return;
    this.defeated = true;
    this.phase = 'victory';
    if (this.monkeyTimer) this.monkeyTimer.remove();
    if (this.dodgeCountdown) this.dodgeCountdown.remove();
    this.coconuts.forEach(c => { c.alive = false; if (c.life) c.life.remove(); if (c.sprite.active) c.sprite.destroy(); });
    this.coconuts = [];
    this.monkeys.forEach(m => {
      if (m.tickEvent) m.tickEvent.remove();
      if (m.escapeEvent) m.escapeEvent.remove();
      m.timerBar.destroy();
      if (m.sprite.active) m.sprite.destroy();
    });

    this.playSound('victory');
    this.cameras.main.shake(600, 0.025);
    this.gorillaSprite.clearTint();
    this.tweens.killTweensOf(this.gorillaSprite);
    this.tweens.add({
      targets: this.gorillaSprite,
      y: this.gorillaSprite.y - 40, scaleX: 0.05, scaleY: 0.05, alpha: 0,
      duration: 900, ease: 'Power3'
    });

    for (let i = 0; i < 14; i++) {
      const s = this.add.image(300 + Math.random() * 200, 80 + Math.random() * 150, 'star').setDepth(11);
      this.tweens.add({
        targets: s,
        x: 100 + Math.random() * 600, y: 150 + Math.random() * 400,
        scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 700 + Math.random() * 500,
        onComplete: () => s.destroy()
      });
    }

    this.heartMgr.gain();
    this.scoreMgr.add(1000);

    this._showBanner('GORILLA DEFEATED!  +1 ♥', 0xffdd00, () => {
      this.time.delayedCall(400, () => {
        this.scene.start('Game', {
          levelMgr: this.levelMgr,
          scoreMgr: this.scoreMgr,
          heartMgr: this.heartMgr,
          fromBoss: true
        });
      });
    });
  }

  _gameOver() {
    this.defeated = true;
    this.phase = 'gameover';
    this.time.delayedCall(400, () => {
      this.scene.start('GameOver', { scoreMgr: this.scoreMgr });
    });
  }

  _showBanner(text, color, onDone) {
    const banner = this.add.text(400, 280, text, {
      fontSize: '32px', fill: '#' + color.toString(16).padStart(6, '0'),
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({
      targets: banner, alpha: 1, duration: 200, yoyo: true, hold: 900,
      onComplete: () => { banner.destroy(); if (onDone) onDone(); }
    });
  }

  update(time, delta) {
    if (this.defeated) return;
    const dt = delta / 1000;

    // Arrow key movement (always available so player can practice, only coconuts in dodge phase)
    const speed = 200;
    let mx = 0, my = 0;
    if (this.cursors.left.isDown)  mx = -speed;
    else if (this.cursors.right.isDown) mx =  speed;
    if (this.cursors.up.isDown)    my = -speed;
    else if (this.cursors.down.isDown)  my =  speed;

    if (this.phase === 'dodge' && (mx !== 0 || my !== 0)) {
      this.penguinX = Phaser.Math.Clamp(this.penguinX + mx * dt, 28, 772);
      this.penguinY = Phaser.Math.Clamp(this.penguinY + my * dt, 50, 572);
      this.penguin.setPosition(this.penguinX, this.penguinY);
      this.launcher.setPosition(this.penguinX, this.penguinY);
    }

    // Coconut collision (dodge phase only)
    if (this.phase === 'dodge') {
      for (let i = this.coconuts.length - 1; i >= 0; i--) {
        const c = this.coconuts[i];
        if (!c.alive || !c.sprite.active) { this.coconuts.splice(i, 1); continue; }
        if (c.sprite.x < -60 || c.sprite.x > 860 || c.sprite.y < -60 || c.sprite.y > 660) {
          c.alive = false; c.life.remove(); c.sprite.destroy(); this.coconuts.splice(i, 1); continue;
        }
        const dx = c.sprite.x - this.penguinX;
        const dy = c.sprite.y - this.penguinY;
        if (Math.sqrt(dx * dx + dy * dy) < 26) {
          c.alive = false; c.life.remove(); c.sprite.destroy(); this.coconuts.splice(i, 1);
          this.playSound('heartlost');
          this.cameras.main.shake(250, 0.015);
          const dead = this.heartMgr.lose();
          this._buildHeartHUD();
          if (dead) { this._gameOver(); return; }
        }
      }
    }

    // Net vs monkey collision (monkey phase)
    if (this.phase === 'monkey') {
      for (let i = this.nets.length - 1; i >= 0; i--) {
        const net = this.nets[i];
        if (!net.alive || !net.sprite.active) { this.nets.splice(i, 1); continue; }
        if (net.sprite.x < -60 || net.sprite.x > 860 || net.sprite.y < -60 || net.sprite.y > 660) {
          net.alive = false; net.lifeTimer.remove(); net.sprite.destroy(); this.nets.splice(i, 1); continue;
        }
        let hit = null;
        for (const m of this.monkeys) {
          if (m.caught || m.escaped || !m.sprite.active) continue;
          const dx = net.sprite.x - m.sprite.x;
          const dy = net.sprite.y - m.sprite.y;
          if (Math.sqrt(dx * dx + dy * dy) < 52) { hit = m; break; }
        }
        if (hit) {
          net.alive = false; net.lifeTimer.remove(); net.sprite.destroy(); this.nets.splice(i, 1);
          this._catchMonkey(hit);
        }
      }
    }
  }
}
