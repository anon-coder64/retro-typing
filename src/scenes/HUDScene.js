// Retro Typing - HUD Overlay Scene
// Runs in parallel with game scenes to show score, WPM, timer, lives

(function () {
  class HUDScene extends Phaser.Scene {
    constructor() {
      super({ key: 'HUD' });
    }

    init(data) {
      this.scoreManager = data.scoreManager;
      this.lives = data.lives || 3;
      this.maxLives = data.lives || 3;
      this.roundTime = data.roundTime || 60;
      this.timeLeft = this.roundTime;
      this.gameSceneKey = data.gameSceneKey;
    }

    create() {
      var w = this.cameras.main.width;
      var style = {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#33ff33'
      };

      // Score
      this.scoreText = this.add.text(15, 10, 'SCORE: 0', style);

      // WPM
      this.wpmText = this.add.text(15, 30, 'WPM: 0', style);

      // Accuracy
      this.accText = this.add.text(200, 10, 'ACC: 100%', style);

      // Combo
      this.comboText = this.add.text(200, 30, '', style);

      // Timer
      this.timerText = this.add.text(w - 15, 10, 'TIME: ' + this.roundTime, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ffcc00'
      }).setOrigin(1, 0);

      // Lives (hearts)
      this.livesText = this.add.text(w - 15, 30, this.getLivesString(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ff3333'
      }).setOrigin(1, 0);

      // Timer countdown
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this.tick,
        callbackScope: this,
        loop: true
      });
    }

    tick() {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        // Notify parent game scene
        var gameScene = this.scene.get(this.gameSceneKey);
        if (gameScene && gameScene.onTimeUp) {
          gameScene.onTimeUp();
        }
      }
    }

    getLivesString() {
      var hearts = '';
      for (var i = 0; i < this.maxLives; i++) {
        hearts += i < this.lives ? '\u2665 ' : '\u2661 ';
      }
      return hearts;
    }

    setLives(n) {
      this.lives = n;
      this.livesText.setText(this.getLivesString());
      if (n <= 1) {
        this.livesText.setColor('#ff0000');
      }
    }

    update() {
      if (!this.scoreManager) return;

      this.scoreText.setText('SCORE: ' + this.scoreManager.points);
      this.wpmText.setText('WPM: ' + this.scoreManager.getWPM());
      this.accText.setText('ACC: ' + Math.round(this.scoreManager.getAccuracy() * 100) + '%');
      this.timerText.setText('TIME: ' + this.timeLeft);

      if (this.scoreManager.combo > 1) {
        this.comboText.setText('x' + this.scoreManager.combo + ' COMBO');
        this.comboText.setColor('#ffcc00');
      } else {
        this.comboText.setText('');
      }

      // Timer urgency
      if (this.timeLeft <= 10) {
        this.timerText.setColor('#ff3333');
      }
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.HUDScene = HUDScene;
})();
