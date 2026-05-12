export default class Leopard {
  constructor(scene, cycleNum) {
    this.scene = scene;
    this.hitsRequired = cycleNum;
    this.hitsLeft = this.hitsRequired;
    this.active = true;
    this.caught = false;

    this.chargeSpeed = 280 + cycleNum * 40;
    this._spawnCharge();
  }

  _spawnCharge() {
    if (!this.active) return;

    // Pick a random edge entry and cross to opposite side
    const side = Math.floor(Math.random() * 4);
    let sx, sy, ex, ey, flip = false;

    switch (side) {
      case 0: sx = -100; sy = 100 + Math.random() * 400; ex = 900; ey = 100 + Math.random() * 400; break;
      case 1: sx = 900;  sy = 100 + Math.random() * 400; ex = -100; ey = 100 + Math.random() * 400; flip = true; break;
      case 2: sx = 100 + Math.random() * 600; sy = -80; ex = 100 + Math.random() * 600; ey = 680; break;
      case 3: sx = 100 + Math.random() * 600; sy = 680; ex = 100 + Math.random() * 600; ey = -80; break;
    }

    if (this.sprite) this.sprite.destroy();
    this.sprite = this.scene.add.image(sx, sy, 'leopard').setDepth(8).setFlipX(flip);

    // Warning flash
    const warn = this.scene.add.text(400, 50, '⚠ LEOPARD CHARGING!', {
      fontSize: '20px', fill: '#ffaa00', fontFamily: 'monospace', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({ targets: warn, alpha: 0, duration: 800, delay: 400, onComplete: () => warn.destroy() });

    // Charge across screen
    const dx = ex - sx, dy = ey - sy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const duration = (dist / this.chargeSpeed) * 1000;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (side < 2) this.sprite.setAngle(0);
    else this.sprite.setAngle(angle + (sy > ey ? 0 : 0));

    this.chargeTween = this.scene.tweens.add({
      targets: this.sprite,
      x: ex, y: ey,
      duration,
      ease: 'Linear',
      onComplete: () => {
        if (this.active) {
          this.scene.time.delayedCall(600, () => this._spawnCharge());
        }
      }
    });
  }

  checkNet(net) {
    if (!this.active || !this.sprite || !this.sprite.active) return false;
    const dx = net.sprite.x - this.sprite.x;
    const dy = net.sprite.y - this.sprite.y;
    if (Math.sqrt(dx * dx + dy * dy) < 55) {
      this.hitsLeft--;
      this._flashHit();
      net.destroy();
      if (this.hitsLeft <= 0) { this._defeat(); return true; }
    }
    return false;
  }

  _flashHit() {
    this.scene.cameras.main.shake(150, 0.008);
    this.scene.tweens.add({ targets: this.sprite, alpha: 0.3, duration: 80, yoyo: true });
  }

  _defeat() {
    this.active = false;
    this.caught = true;
    if (this.chargeTween) this.chargeTween.stop();
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 0, scaleY: 0, alpha: 0,
      duration: 500,
      onComplete: () => { if (this.sprite) this.sprite.destroy(); }
    });
  }

  getSprite() { return this.sprite; }

  destroy() {
    this.active = false;
    if (this.chargeTween) this.chargeTween.stop();
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}
