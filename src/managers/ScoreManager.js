export default class ScoreManager {
  constructor() {
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('pnc-highscore') || '0');
  }

  add(points) {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('pnc-highscore', this.highScore);
    }
  }

  reset() { this.score = 0; }
  getHighScore() { return this.highScore; }
}
