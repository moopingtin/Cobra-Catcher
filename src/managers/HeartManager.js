export default class HeartManager {
  constructor(max = 3) {
    this.max = max;
    this.current = max;
  }

  lose() { this.current = Math.max(0, this.current - 1); return this.current === 0; }
  gain() { this.current = Math.min(9, this.current + 1); }
  isDead() { return this.current <= 0; }
  reset() { this.current = this.max; }
}
