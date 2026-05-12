export default class NetProjectile {
  constructor(scene, x, y, vx, vy, onHit) {
    this.scene = scene;
    this.onHit = onHit;
    this.alive = true;
    this.catchRadius = 30;

    this.sprite = scene.physics.add.image(x, y, 'net').setDepth(6);
    this.sprite.setVelocity(vx, vy);
    this.sprite.setRotation(Math.atan2(vy, vx));

    scene.playSound('whoosh');

    // Spinning
    scene.tweens.add({
      targets: this.sprite,
      angle: 360,
      duration: 400,
      repeat: -1
    });

    // Auto-destroy after 1.2s
    this.lifeTimer = scene.time.delayedCall(1200, () => { if (this.alive) this.destroy(); });
  }

  checkCobras(cobras) {
    if (!this.alive || !this.sprite.active) return null;
    for (const cobra of cobras) {
      if (cobra.caught || cobra.escaped) continue;
      const s = cobra.getSprite();
      if (!s.active) continue;
      const dx = this.sprite.x - s.x;
      const dy = this.sprite.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.catchRadius + 24) {
        this.destroy();
        return cobra;
      }
    }
    return null;
  }

  isOutOfBounds(w, h) {
    const s = this.sprite;
    return s.x < -60 || s.x > w + 60 || s.y < -60 || s.y > h + 60;
  }

  destroy() {
    this.alive = false;
    if (this.lifeTimer) this.lifeTimer.remove();
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}
