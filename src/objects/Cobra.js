export default class Cobra {
  constructor(scene, x, y, escapeTime, onEscape) {
    this.scene = scene;
    this.caught = false;
    this.escaped = false;
    this.bushX = x;
    this.bushY = y;

    // Spawn slightly above bush
    this.sprite = scene.physics.add.image(x, y - 30, 'cobra').setDepth(4);
    this.sprite.setOrigin(0.5, 1);

    // Pop-up animation
    this.sprite.setScale(0.1);
    scene.tweens.add({
      targets: this.sprite,
      scaleX: 1, scaleY: 1,
      duration: 200,
      ease: 'Back.Out'
    });

    // Play hiss sound
    scene.playSound('hiss');

    // Escape timer bar (shown above cobra)
    this.timerBar = scene.add.graphics().setDepth(5);
    this.escapeTime = escapeTime;
    this.timeLeft = escapeTime;
    this._drawTimerBar(1.0);

    // Countdown
    this.timerEvent = scene.time.addEvent({
      delay: 100,
      repeat: Math.floor(escapeTime * 10) - 1,
      callback: () => {
        if (this.caught || this.escaped) return;
        this.timeLeft -= 0.1;
        this._drawTimerBar(this.timeLeft / this.escapeTime);
      }
    });

    // Escape trigger
    this.escapeEvent = scene.time.delayedCall(escapeTime * 1000, () => {
      if (!this.caught) this._doEscape(onEscape);
    });
  }

  _drawTimerBar(fraction) {
    const bx = this.sprite.x - 24;
    const by = this.sprite.y - this.sprite.displayHeight - 48;
    this.timerBar.clear();
    // Background
    this.timerBar.fillStyle(0x333333); this.timerBar.fillRect(bx, by, 48, 6);
    // Fill
    const color = fraction > 0.5 ? 0x00ff44 : fraction > 0.25 ? 0xffaa00 : 0xff2200;
    this.timerBar.fillStyle(color); this.timerBar.fillRect(bx, by, Math.floor(48 * fraction), 6);
  }

  _doEscape(onEscape) {
    this.escaped = true;
    this.sprite.setTexture('cobra-escape');
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.bushX + (Math.random() > 0.5 ? 200 : -200),
      y: this.bushY + 60,
      alpha: 0,
      duration: 600,
      onComplete: () => this.destroy()
    });
    if (onEscape) onEscape();
  }

  catch() {
    this.caught = true;
    if (this.timerEvent) this.timerEvent.remove();
    if (this.escapeEvent) this.escapeEvent.remove();
    this.timerBar.destroy();

    // Catch animation
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 0, scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => this.sprite.destroy()
    });
  }

  getSprite() { return this.sprite; }

  destroy() {
    if (this.timerEvent) this.timerEvent.remove();
    if (this.escapeEvent) this.escapeEvent.remove();
    this.timerBar.destroy();
    if (this.sprite && this.sprite.active) this.sprite.destroy();
  }
}
