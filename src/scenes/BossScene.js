import NetProjectile from '../objects/NetProjectile.js';
import Leopard from '../objects/bosses/Leopard.js';
import ButterflyHorde from '../objects/bosses/ButterflyHorde.js';
import CobraKing from '../objects/bosses/CobraKing.js';

export default class BossScene extends Phaser.Scene {
  constructor() { super('Boss'); }

  init(data) {
    this.levelMgr = data.levelMgr;
    this.scoreMgr = data.scoreMgr;
    this.heartMgr = data.heartMgr;
  }

  create() {
    this._setupAudio();
    this._buildBackground();
    this._buildPenguin();
    this._buildHUD();
    this._buildAimLine();
    this._setupInput();

    this.nets = [];
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 400, y: 300 };
    this.bossDefeated = false;
    this.bossType = this.levelMgr.getBossType();
    this.cycleNum = this.levelMgr.getBossCycleNumber();

    // Boss intro banner
    const bossNames = { leopard: 'THE LEOPARD', butterflies: 'BUTTERFLY HORDE', 'cobra-king': 'COBRA KING' };
    this._showBanner(`BOSS: ${bossNames[this.bossType]}`, 0xff4400);

    this.time.delayedCall(1200, () => {
      this._spawnBoss();
      this.playSound('boss');
    });

    this.butterflyTimer = this.bossType === 'butterflies' ? 0 : null;
    this.bfCountText = null;

    if (this.bossType === 'butterflies') {
      this.bfCountText = this.add.text(400, 30, '', {
        fontSize: '16px', fill: '#ffcc44', fontFamily: 'monospace'
      }).setOrigin(0.5).setDepth(10);
    }
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
      case 'boss':
        [200, 300, 500, 700].forEach((freq, i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = 'sawtooth'; o2.frequency.value = freq;
          g2.gain.setValueAtTime(0.3, t + i * 0.1); g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.18);
          o2.start(t + i * 0.1); o2.stop(t + i * 0.1 + 0.2);
        }); break;
      case 'levelup':
        [300, 400, 600].forEach((freq, i) => {
          const o2 = ctx.createOscillator(); const g2 = ctx.createGain();
          o2.connect(g2); g2.connect(ctx.destination);
          o2.type = 'square'; o2.frequency.value = freq;
          g2.gain.setValueAtTime(0.25, t + i * 0.12); g2.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.15);
          o2.start(t + i * 0.12); o2.stop(t + i * 0.12 + 0.2);
        }); break;
    }
  }

  _buildBackground() {
    this.add.image(400, 300, 'background').setDepth(0);
    // Red tint overlay for boss drama
    const tint = this.add.graphics().setDepth(1);
    tint.fillStyle(0x330000, 0.25);
    tint.fillRect(0, 0, 800, 600);
  }

  _buildPenguin() {
    this.penguin = this.add.image(400, 300, 'penguin').setDepth(5).setOrigin(0.5, 0.6);
    this.launcher = this.add.image(400, 300, 'launcher').setDepth(6).setOrigin(0.05, 0.5);
  }

  _buildHUD() {
    this.scoreText = this.add.text(780, 10, `Score: ${this.scoreMgr.score}`, {
      fontSize: '16px', fill: '#ffffff', fontFamily: 'monospace'
    }).setOrigin(1, 0).setDepth(10);

    this.levelText = this.add.text(400, 10, `BOSS LEVEL ${this.levelMgr.level}`, {
      fontSize: '16px', fill: '#ff4444', fontFamily: 'monospace'
    }).setOrigin(0.5, 0).setDepth(10);

    this.heartImages = [];
    this._buildHeartHUD();
  }

  _buildHeartHUD() {
    this.heartImages.forEach(h => h.destroy());
    this.heartImages = [];
    const count = Math.max(this.heartMgr.current, 3);
    for (let i = 0; i < Math.min(count, 9); i++) {
      this.heartImages.push(
        this.add.image(14 + i * 26, 14, i < this.heartMgr.current ? 'heart-full' : 'heart-empty')
          .setOrigin(0, 0).setDepth(10)
      );
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
    const fireAngle = Math.atan2(-dy, -dx);
    this.launcher.setRotation(fireAngle);
    this.aimGraphics.clear();
    this.aimGraphics.lineStyle(2, 0xffff00, 0.5);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(400, 300);
    this.aimGraphics.lineTo(400 + Math.cos(fireAngle) * 120, 300 + Math.sin(fireAngle) * 120);
    this.aimGraphics.strokePath();
    this.aimGraphics.lineStyle(2, 0xffaa44, 0.7);
    this.aimGraphics.beginPath();
    this.aimGraphics.moveTo(400, 300);
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
    const net = new NetProjectile(this, 400, 300, Math.cos(angle) * speed, Math.sin(angle) * speed, null);
    this.nets.push(net);
    this.aimGraphics.clear();
    this.isDragging = false;
  }

  _spawnBoss() {
    switch(this.bossType) {
      case 'leopard':
        this.boss = new Leopard(this, this.cycleNum);
        break;
      case 'butterflies':
        this.boss = new ButterflyHorde(this, this.cycleNum);
        break;
      case 'cobra-king':
        this.boss = new CobraKing(this, this.cycleNum, this.levelMgr.getEscapeTime());
        this.events.on('minion-escaped', () => this._onMinionEscape());
        break;
    }
  }

  _onMinionEscape() {
    const dead = this.heartMgr.lose();
    this.playSound('heartlost');
    this._buildHeartHUD();
    this.cameras.main.shake(300, 0.012);
    if (dead) this._gameOver();
  }

  _showBanner(text, color, onDone) {
    const banner = this.add.text(400, 280, text, {
      fontSize: '36px', fill: '#' + color.toString(16).padStart(6, '0'),
      fontFamily: 'monospace', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(20).setAlpha(0);
    this.tweens.add({
      targets: banner, alpha: 1, duration: 200, yoyo: true, hold: 800,
      onComplete: () => { banner.destroy(); if (onDone) onDone(); }
    });
  }

  _spawnSparkle(x, y) {
    for (let i = 0; i < 8; i++) {
      const star = this.add.image(x, y, 'star').setDepth(9);
      const angle = (i / 8) * Math.PI * 2;
      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * 60, y: y + Math.sin(angle) * 60,
        alpha: 0, scaleX: 0, scaleY: 0, duration: 500,
        onComplete: () => star.destroy()
      });
    }
  }

  _onBossDefeated() {
    if (this.bossDefeated) return;
    this.bossDefeated = true;

    this.heartMgr.gain();
    this.scoreMgr.add(500);
    this.playSound('levelup');
    this._buildHeartHUD();
    this.scoreText.setText(`Score: ${this.scoreMgr.score}`);

    this._spawnSparkle(400, 300);

    this._showBanner('+1 HEART! Boss Cleared!', 0xffdd44, () => {
      this.time.delayedCall(300, () => {
        this.levelMgr.nextLevel();
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
    this.time.delayedCall(400, () => {
      this.scene.start('GameOver', { scoreMgr: this.scoreMgr });
    });
  }

  update(time, delta) {
    if (this.bossDefeated || !this.boss) return;

    // Clean dead nets
    for (let i = this.nets.length - 1; i >= 0; i--) {
      const net = this.nets[i];
      if (!net.alive || net.isOutOfBounds(800, 600)) {
        net.destroy(); this.nets.splice(i, 1);
      }
    }

    // Boss-type-specific update
    if (this.bossType === 'leopard') {
      for (let i = this.nets.length - 1; i >= 0; i--) {
        const net = this.nets[i];
        if (!net.alive) continue;
        if (this.boss.checkNet(net)) {
          this.nets.splice(i, 1);
          if (this.boss.caught) { this._spawnSparkle(400, 300); this._onBossDefeated(); }
        }
      }

    } else if (this.bossType === 'butterflies') {
      this.boss.update(delta, this.nets);
      this.nets = this.nets.filter(n => n.alive);

      const caught = this.boss.getCaughtCount();
      const needed = Math.ceil((this.boss.totalCount) * 0.75);
      if (this.bfCountText) {
        this.bfCountText.setText(`Butterflies caught: ${caught} / ${needed}`);
      }
      if (caught >= needed) {
        this.boss.destroy();
        this.boss.done = true;
        this._onBossDefeated();
      }

    } else if (this.bossType === 'cobra-king') {
      // Check nets on king
      for (let i = this.nets.length - 1; i >= 0; i--) {
        const net = this.nets[i];
        if (!net.alive) continue;
        if (this.boss.checkNet(net)) {
          this.nets.splice(i, 1);
          if (this.boss.caught) { this._onBossDefeated(); }
        }
      }
      // Check nets on minions (for score)
      const caughtMinions = this.boss.checkNetsOnMinions(this.nets);
      caughtMinions.forEach(m => {
        this.scoreMgr.add(100);
        this.scoreText.setText(`Score: ${this.scoreMgr.score}`);
      });
      this.nets = this.nets.filter(n => n.alive);
    }
  }
}
