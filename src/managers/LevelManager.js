export default class LevelManager {
  constructor() { this.reset(); }

  reset() {
    this.level = 1;
    this.cobrasRequired = 3;
    this.caughtThisLevel = 0;
  }

  isBossLevel() { return this.level % 5 === 0; }

  getBossType() {
    const cycle = Math.floor((this.level / 5 - 1) % 3);
    return ['leopard', 'butterflies', 'cobra-king'][cycle];
  }

  getBossCycleNumber() { return Math.floor((this.level - 1) / 15) + 1; }

  getBushCount() { return Math.min(3 + Math.floor((this.level - 1) / 3), 8); }

  getEscapeTime() { return Math.max(1.0, 2.5 - (this.level - 1) * 0.05); }

  getSpawnInterval() { return Math.max(1500, 3500 - (this.level - 1) * 80); }

  catchCobra() {
    this.caughtThisLevel++;
    return this.caughtThisLevel >= this.cobrasRequired;
  }

  nextLevel() {
    this.level++;
    this.cobrasRequired = 3 + (this.level - 1) * 2;
    this.caughtThisLevel = 0;
  }
}
