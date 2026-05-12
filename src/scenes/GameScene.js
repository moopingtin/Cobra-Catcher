import Bush from '../objects/Bush.js';
import Cobra from '../objects/Cobra.js';
import NetProjectile from '../objects/NetProjectile.js';
import LevelManager from '../managers/LevelManager.js';
import ScoreManager from '../managers/ScoreManager.js';
import HeartManager from '../managers/HeartManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  init(data) {
    // Allow boss scene to pass back managers so state persists
    this.levelMgr = data.levelMgr || new LevelManager();
    this.scoreMgr = data.scoreMgr || new ScoreManager();
    this.heartMgr = data.heartMgr || new HeartManager();
    this.fromBoss = data.fromBoss || false;
  }

  create() {
    this._setupAudio();
    this._buildBackground();
    this.cobras = [];
    this.nets = [];
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.levelComplete = false;

    this._buildBushes();
    this._buildPenguin();
    this._buildHUD();
    this._buildAimLine();
    this._setupInput();
    this._startSpawnLoop();

    if (this.fromBoss) {
      this._showBanner(`Level ${this.levelMgr.level}`, 0x44ff88);
    }

    // Progress label
    this.progressText = this.add.text(400, 570, this._progressStr(), {
      fontSize: '14px', fill: '#aaffaa', fontFamily: 'monospace'
    }).setOrigin(0.5).setDepth(10);
  }

  _progressStr() {
    const l = this.levelMgr;
    return `Caught: ${l.caughtThisLevel} / ${l.cobrasRequired}`;
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
        osc.type = 'sine'; osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.4);
        gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.4); break;
      case 'whoosh':
        osc.type = 'sine'; osc.frequency.setValueAtTime(400, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        gain.gain.setValueAtTime(0.25, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t); osc.stop(t + 0.2); break;
      case 'catch':
        osc.type = 'square'; osc.frequency.setValueAtTime(300, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
        gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.start(t); osc.stop(t + 0.25); break;
      case 'heartlost':
        osc.type = 'square'; osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);
        gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t); osc.stop(t + 0.5); break;
      case 'levelup':
        [300, 400, 600].forEach((freq, i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = 'square'; o2.frequency.value = freq;
          g2.gain.setValueAtTime(0.25, t + i * 0.12); g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.15);
          o2.start(t + i * 0.12); o2.stop(t + i * 0.12 + 0.2);
        }); break;
      case 'boss':
        [200, 300, 500, 700].forEach((freq, i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = 'sawtooth'; o2.frequency.value = freq;
          g2.gain.setValueAtTime(0.3, t + i * 0.1); g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.18);
          o2.start(t + i * 0.1); o2.stop(t + i * 0.1 + 0.2);
        }); break;
    }
  }

  _buildBackground() {
    this.add.image(400, 300, 'background').setDepth(0);
  }

  _buildBushes() {
    this.bushes = [];
    this._arrangeBushes();
  }

  _arrangeBushes() {
    // Destroy old bushes
    this.bushes.forEach(b => b.destroy());
    this.bushes = [];

    const count = this.levelMgr.getBushCount();
    const cx = 400, cy = 300;
    const radius = 210;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius * 0.75;
      this.bushes.push(new Bush(this, x, y));
    }
  }

  _buildPenguin() {
    this.penguin = this.add.image(400, 300, 'penguin').setDepth(5).setOrigin(0.5, 0.6);
    this.launcher = this.add.image(400, 300, 'launcher').setDepth(6).setOrigin(0.05, 0.5);
  }

  _buildHUD() {
    // Score
    this.scoreText = this.add.text(780, 10, `Score: ${this.scoreMgr.score}`, {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(1, 0).setDepth(10);

    // Level
    this.levelText = this.add.text(400, 10, `Level ${this.levelMgr.level}`, {
      fontSize: '16px', fill: '#ffff88', fontFamily: 'monospace'
    }).setOrigin(0.5, 0).setDepth(10);

    // Hearts
    this.heartImages = [];
    this._buildHeartHUD();
  }

  _buildHeartHUD() {
    this.heartImages.forEach(h => h.destroy());
    this.heartImages = [];
    const max = Math.max(this.heartMgr.current, this.heartMgr.max, 3);
    for (let i = 0; i < Math.min(max, 9); i++) {
      const img = this.add.image(14 + i * 26, 14, i < this.heartMgr.current ? 'heart-full' : 'heart-empty')
        .setOrigin(0, 0).setDepth(10);
      this.heartImages.push(img);
    }
  }

  _buildAimLine() {
    this.aimGraphics = this.add.graphics().setDepth(7);
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
      this._updateLauncher();
    });

    this.input.on('pointerup', () => { this.isDragging = false; });

    this.input.keyboard.on('keydown-SPACE', () => { this._fireNet(); });
    this.input.keyboard.on('keydown-R', () => { this.scene.start('Game', {}); });
  }

  _updateLauncher() {
    if (!this.isDragging) return;
    const dx = this.dragCurrent.x - this.dragStart.x;
    const dy = this.dragCurrent.y - this.dragStart.y;
    if (Math.sqrt(dx * dx + dy * dy) < 5) return;

    // Aim direction is OPPOSITE of drag (slingshot)
    const fireAngle = Math.atan2(-dy, -dx);
    this.launcher.setRotation(fireAngle);

    // Draw aim rubber-band
    this.aimGraphics.clear();
    const px = 400, py = 300;
    // Dotted aim line (opposite direction)
    this.aimGraphics.lineStyle(2, 0xffff00, 0.5);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(px, py);
    const previewLen = 120;
    this.aimGraphics.lineTo(px + Math.cos(fireAngle) * previewLen, py + Math.sin(fireAngle) * previewLen);
    this.aimGraphics.strokePath();
    // Rubber band pull-back line
    this.aimGraphics.lineStyle(2, 0xffaa44, 0.7);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(px, py);
    this.aimGraphics.lineTo(this.dragCurrent.x, this.dragCurrent.y);
    this.aimGraphics.strokePath();
  }

  _fireNet() {
    const dx = this.dragCurrent.x - this.dragStart.x;
    const dy = this.dragCurrent.y - this.dragStart.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 5) return;

    const speed = 480;
    const angle = Math.atan2(-dy, -dx);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const net = new NetProjectile(this, 400, 300, vx, vy, null);
    this.nets.push(net);

    this.aimGraphics.clear();
    this.isDragging = false;
  }

  _startSpawnLoop() {
    this._scheduleNextSpawn();
  }

  _scheduleNextSpawn() {
    if (this.levelComplete) return;
    const interval = this.levelMgr.getSpawnInterval();
    this.spawnTimer = this.time.delayedCall(interval, () => {
      this._spawnCobra();
      this._scheduleNextSpawn();
    });
  }

  _spawnCobra() {
    if (this.levelComplete) return;
    const availBushes = this.bushes.filter(b => !b.isRustling);
    if (availBushes.length === 0) return;

    const bush = availBushes[Math.floor(Math.random() * availBushes.length)];
    bush.rustle((bx, by) => {
      bush.setHighlight(true);
      const cobra = new Cobra(this, bx, by, this.levelMgr.getEscapeTime(), () => {
        this._onCobraEscape(cobra, bush);
      });
      cobra.sourceBush = bush;
      this.cobras.push(cobra);
    });
  }

  _onCobraEscape(cobra, bush) {
    bush.resetRustle();
    this.cobras = this.cobras.filter(c => c !== cobra);

    const dead = this.heartMgr.lose();
    this.playSound('heartlost');
    this._buildHeartHUD();

    // Screen shake
    this.cameras.main.shake(300, 0.012);

    if (dead) {
      this.time.delayedCall(400, () => {
        this.scene.start('GameOver', { scoreMgr: this.scoreMgr });
      });
    }
  }

  _onCobraCaught(cobra, bush) {
    bush.resetRustle();
    this.cobras = this.cobras.filter(c => c !== cobra);
    cobra.catch();

    this.playSound('catch');

    // Score
    const speedBonus = cobra.timeLeft > cobra.escapeTime - 0.5 ? 50 : 0;
    this.scoreMgr.add(100 + speedBonus);
    this._updateHUD();

    // Sparkle at last known cobra position
    this._spawnSparkle(cobra.bushX, cobra.bushY - 30);

    // Level progress
    const levelDone = this.levelMgr.catchCobra();
    this.progressText.setText(this._progressStr());

    if (levelDone) {
      this._onLevelComplete();
    }
  }

  _onLevelComplete() {
    this.levelComplete = true;
    if (this.spawnTimer) this.spawnTimer.remove();
    this.playSound('levelup');

    this.levelMgr.nextLevel();

    if (this.levelMgr.isBossLevel()) {
      this._showBanner(`BOSS LEVEL ${this.levelMgr.level}!`, 0xff4400, () => {
        this.playSound('boss');
        this.time.delayedCall(300, () => {
          this.scene.start('Boss', {
            levelMgr: this.levelMgr,
            scoreMgr: this.scoreMgr,
            heartMgr: this.heartMgr
          });
        });
      });
    } else {
      this._showBanner(`Level ${this.levelMgr.level - 1} Clear!`, 0x44ff88, () => {
        this.time.delayedCall(200, () => {
          this._restartLevel();
        });
      });
    }
  }

  _restartLevel() {
    this.cobras.forEach(c => c.destroy());
    this.cobras = [];
    this.nets.forEach(n => n.destroy());
    this.nets = [];
    this.levelComplete = false;

    this._arrangeBushes();
    this._updateHUD();
    this.progressText.setText(this._progressStr());
    this._startSpawnLoop();
  }

  _updateHUD() {
    this.scoreText.setText(`Score: ${this.scoreMgr.score}`);
    this.levelText.setText(`Level ${this.levelMgr.level}`);
  }

  _showBanner(text, color, onDone) {
    const banner = this.add.text(400, 280, text, {
      fontSize: '36px', fill: '#' + color.toString(16).padStart(6, '0'),
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setAlpha(0);

    this.tweens.add({
      targets: banner,
      alpha: 1,
      duration: 200,
      yoyo: true,
      hold: 800,
      onComplete: () => { banner.destroy(); if (onDone) onDone(); }
    });
  }

  _spawnSparkle(x, y) {
    for (let i = 0; i < 6; i++) {
      const star = this.add.image(x, y, 'star').setDepth(8);
      const angle = (i / 6) * Math.PI * 2;
      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 40,
        y: y + Math.sin(angle) * 40,
        alpha: 0,
        scaleX: 0, scaleY: 0,
        duration: 400,
        onComplete: () => star.destroy()
      });
    }
  }

  update() {
    if (this.levelComplete) return;

    // Check nets against cobras
    for (let i = this.nets.length - 1; i >= 0; i--) {
      const net = this.nets[i];
      if (!net.alive) { this.nets.splice(i, 1); continue; }
      if (net.isOutOfBounds(800, 600)) { net.destroy(); this.nets.splice(i, 1); continue; }

      const hit = net.checkCobras(this.cobras);
      if (hit) {
        this._onCobraCaught(hit, hit.sourceBush || this.bushes[0]);
        this.nets.splice(i, 1);
      }
    }
  }
}
