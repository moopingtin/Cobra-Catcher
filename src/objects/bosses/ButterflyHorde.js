export default class ButterflyHorde {
  constructor(scene, cycleNum) {
    this.scene = scene;
    this.cycleNum = cycleNum;
    this.totalCount = 8 + (cycleNum - 1) * 4;
    this.tocatch = Math.ceil(this.totalCount * 0.75);
    this.caught = 0;
    this.butterflies = [];
    this.done = false;
    this.speed = 100 + cycleNum * 30;

    this._spawnAll();
  }

  _spawnAll() {
    for (let i = 0; i < this.totalCount; i++) {
      this.scene.time.delayedCall(i * 180, () => {
        if (this.done) return;
        this._spawnButterfly();
      });
    }
  }

  _spawnButterfly() {
    const x = 80 + Math.random() * 640;
    const y = 80 + Math.random() * 440;
    const bf = {
      sprite: this.scene.add.image(x, y, 'butterfly').setDepth(8),
      caught: false,
      angle: Math.random() * Math.PI * 2,
      radius: 40 + Math.random() * 60,
      cx: x,
      cy: y,
      speed: this.speed * (0.8 + Math.random() * 0.4),
      flapTimer: 0
    };

    // Drift the center point
    this.scene.tweens.add({
      targets: { x: bf.cx, y: bf.cy },
      x: 80 + Math.random() * 640,
      y: 80 + Math.random() * 440,
      duration: 2000 + Math.random() * 2000,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
      onUpdate: (tween, target) => { bf.cx = target.x; bf.cy = target.y; }
    });

    this.butterflies.push(bf);
  }

  update(delta, nets) {
    for (const bf of this.butterflies) {
      if (bf.caught || !bf.sprite.active) continue;

      // Circular orbit
      bf.angle += (bf.speed / bf.radius) * (delta / 1000);
      bf.sprite.x = bf.cx + Math.cos(bf.angle) * bf.radius;
      bf.sprite.y = bf.cy + Math.sin(bf.angle) * bf.radius;

      // Flap
      bf.flapTimer += delta;
      bf.sprite.setTexture(bf.flapTimer % 300 < 150 ? 'butterfly' : 'butterfly-flap');

      // Check nets
      for (const net of nets) {
        if (!net.alive || !net.sprite.active) continue;
        const dx = net.sprite.x - bf.sprite.x;
        const dy = net.sprite.y - bf.sprite.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          bf.caught = true;
          this.caught++;
          net.destroy();
          this.scene.tweens.add({ targets: bf.sprite, scaleX: 0, scaleY: 0, alpha: 0, duration: 250, onComplete: () => bf.sprite.destroy() });
          break;
        }
      }
    }
  }

  getCaughtCount() { return this.caught; }
  getRequired() { return this.tocatch; }
  isComplete() { return this.caught >= this.tocatch; }

  destroy() {
    this.done = true;
    this.butterflies.forEach(bf => { if (bf.sprite.active) bf.sprite.destroy(); });
    this.butterflies = [];
  }
}
