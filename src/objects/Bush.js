export default class Bush {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.sprite = scene.add.image(x, y, 'bush').setDepth(3);
    this.sprite.setOrigin(0.5, 0.8);
    this.isRustling = false;
    this.rustleTimer = null;
    this.rustleTween = null;
  }

  rustle(onCobraReady) {
    if (this.isRustling) return;
    this.isRustling = true;

    // Shake animation
    this.rustleTween = this.scene.tweens.add({
      targets: this.sprite,
      x: { from: this.x - 4, to: this.x + 4 },
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => { this.sprite.x = this.x; }
    });

    // Play rustle sound
    this.scene.playSound('rustle');

    // After short delay, cobra pops out
    this.rustleTimer = this.scene.time.delayedCall(600, () => {
      onCobraReady(this.x, this.y);
    });
  }

  resetRustle() {
    this.isRustling = false;
    this.sprite.setTexture('bush');
    if (this.rustleTimer) { this.rustleTimer.remove(); this.rustleTimer = null; }
  }

  setHighlight(on) {
    this.sprite.setTexture(on ? 'bush-rustle' : 'bush');
  }

  destroy() {
    if (this.rustleTween) this.rustleTween.stop();
    if (this.rustleTimer) this.rustleTimer.remove();
    this.sprite.destroy();
  }
}
