import Cobra from '../Cobra.js';

export default class CobraKing {
  constructor(scene, cycleNum, escapeTime) {
    this.scene = scene;
    this.cycleNum = cycleNum;
    this.hitsRequired = 2 + cycleNum;
    this.hitsLeft = this.hitsRequired;
    this.active = true;
    this.caught = false;
    this.minions = [];
    this.escapeTime = escapeTime;

    this._spawnKing();
    this._spawnMinions(3 + cycleNum - 1);
  }

  _spawnKing() {
    this.king = this.scene.add.image(400, 240, 'cobra-king').setDepth(8).setScale(0.5);
    this.scene.tweens.add({ targets: this.king, scaleX: 1, scaleY: 1, duration: 500, ease: 'Back.Out' });

    // King bobs up and down
    this.scene.tweens.add({
      targets: this.king,
      y: 260,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut'
    });

    // Health bar bg
    this.hpBg = this.scene.add.graphics().setDepth(9);
    this.hpFill = this.scene.add.graphics().setDepth(9);
    this.hpLabel = this.scene.add.text(400, 134, 'COBRA KING', {
      fontSize: '12px', fill: '#ff4444', fontFamily: 'monospace'
    }).setOrigin(0.5, 1).setDepth(10);
    this._drawHP();
  }

  _drawHP() {
    this.hpBg.clear();
    this.hpFill.clear();
    const bx = 280, by = 140, bw = 240, bh = 14;
    this.hpBg.fillStyle(0x333333); this.hpBg.fillRect(bx, by, bw, bh);
    const frac = this.hitsLeft / this.hitsRequired;
    this.hpFill.fillStyle(frac > 0.5 ? 0x00ff44 : frac > 0.25 ? 0xffaa00 : 0xff2200);
    this.hpFill.fillRect(bx, by, Math.floor(bw * frac), bh);
  }

  _spawnMinions(count) {
    const positions = [
      [180, 180], [620, 180], [150, 420], [650, 420],
      [400, 480], [200, 300], [600, 300]
    ];
    for (let i = 0; i < Math.min(count, positions.length); i++) {
      const [px, py] = positions[i];
      const cobra = new Cobra(this.scene, px, py, this.escapeTime, () => {
        this.minions = this.minions.filter(m => m !== cobra);
        this.scene.events.emit('minion-escaped');
      });
      this.minions.push(cobra);
    }
  }

  checkNet(net) {
    if (!this.active || !this.king || !this.king.active) return false;
    const dx = net.sprite.x - this.king.x;
    const dy = net.sprite.y - this.king.y;
    if (Math.sqrt(dx * dx + dy * dy) < 52) {
      this.hitsLeft--;
      net.destroy();
      this.scene.cameras.main.shake(200, 0.01);
      this.scene.tweens.add({ targets: this.king, alpha: 0.3, duration: 100, yoyo: true, repeat: 2 });
      this._drawHP();
      if (this.hitsLeft <= 0) { this._defeat(); return true; }
    }
    return false;
  }

  checkNetsOnMinions(nets) {
    const caught = [];
    for (const minion of this.minions) {
      if (minion.caught || minion.escaped) continue;
      for (const net of nets) {
        if (!net.alive) continue;
        const s = minion.getSprite();
        if (!s || !s.active) continue;
        const dx = net.sprite.x - s.x;
        const dy = net.sprite.y - s.y;
        if (Math.sqrt(dx * dx + dy * dy) < 36) {
          minion.catch();
          net.destroy();
          this.minions = this.minions.filter(m => m !== minion);
          caught.push(minion);
          break;
        }
      }
    }
    return caught;
  }

  _defeat() {
    this.active = false;
    this.caught = true;
    this.minions.forEach(m => m.destroy());
    this.minions = [];

    this.scene.tweens.add({
      targets: this.king,
      scaleX: 3, scaleY: 3, alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        if (this.king) this.king.destroy();
        if (this.hpBg) this.hpBg.destroy();
        if (this.hpFill) this.hpFill.destroy();
        if (this.hpLabel) this.hpLabel.destroy();
      }
    });
  }

  destroy() {
    this.active = false;
    this.minions.forEach(m => m.destroy());
    this.minions = [];
    if (this.king && this.king.active) this.king.destroy();
    if (this.hpBg) this.hpBg.destroy();
    if (this.hpFill) this.hpFill.destroy();
    if (this.hpLabel) this.hpLabel.destroy();
  }
}
