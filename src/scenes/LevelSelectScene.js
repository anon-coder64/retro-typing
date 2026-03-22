// Retro Typing - Level Select Scene

(function () {
  class LevelSelectScene extends Phaser.Scene {
    constructor() {
      super({ key: 'LevelSelect' });
    }

    init(data) {
      this.gameKey = data.gameKey;
      this.sceneName = data.sceneName;
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var centerX = w / 2;
      var LS = RetroTyping.LevelSystem;

      this.cameras.main.setBackgroundColor('#0a0a2e');

      // Title
      this.add.text(centerX, 50, 'SELECT LEVEL', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '24px',
        color: '#33ff33'
      }).setOrigin(0.5);

      // Levels
      var startY = 130;
      var spacing = 80;
      var scores = new RetroTyping.ScoreManager().getHighScores(this.gameKey);

      for (var i = 1; i <= LS.getTotalLevels(); i++) {
        (function (level) {
          var config = LS.getLevel(level);
          var unlocked = LS.isUnlocked(this.gameKey, level);
          var y = startY + (level - 1) * spacing;
          var score = scores[String(level)];

          // Button
          var btn = this.add.image(centerX, y, 'button-wide');
          if (unlocked) btn.setInteractive({ useHandCursor: true });

          // Level number and name
          var color = unlocked ? '#33ff33' : '#444444';
          this.add.text(centerX - 120, y - 10, 'LV ' + level, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: color
          }).setOrigin(0, 0.5);

          this.add.text(centerX - 120, y + 10, config.description, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: unlocked ? '#aaaaaa' : '#333333'
          }).setOrigin(0, 0.5);

          // Stars
          if (score) {
            for (var s = 0; s < 3; s++) {
              this.add.text(centerX + 80 + s * 20, y, s < score.bestStars ? '\u2605' : '\u2606', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '16px',
                color: s < score.bestStars ? '#ffcc00' : '#444444'
              }).setOrigin(0.5);
            }
          }

          // Lock icon
          if (!unlocked) {
            this.add.image(centerX + 120, y, 'lock').setScale(1.5);
          }

          if (unlocked) {
            btn.on('pointerover', function () { btn.setTint(0x444444); });
            btn.on('pointerout', function () { btn.clearTint(); });
            btn.on('pointerdown', function () {
              this.scene.start(this.sceneName, { level: level, gameKey: this.gameKey });
            }.bind(this));
          }
        }.bind(this))(i);
      }

      // Back button
      var backBtn = this.add.text(50, h - 40, '< BACK', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ff6633'
      }).setInteractive({ useHandCursor: true });

      backBtn.on('pointerover', function () { backBtn.setColor('#ffffff'); });
      backBtn.on('pointerout', function () { backBtn.setColor('#ff6633'); });
      backBtn.on('pointerdown', function () {
        this.scene.start('Menu');
      }.bind(this));
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.LevelSelectScene = LevelSelectScene;
})();
