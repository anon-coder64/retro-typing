// Retro Typing - Game Over Scene

(function () {
  class GameOverScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameOver' });
    }

    init(data) {
      this.results = data;
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var centerX = w / 2;
      var r = this.results;

      this.cameras.main.setBackgroundColor('#0a0a2e');

      // Title
      var titleText = r.stars >= 2 ? 'GREAT JOB!' : r.stars >= 1 ? 'GOOD TRY!' : 'KEEP PRACTICING!';
      var titleColor = r.stars >= 2 ? '#33ff33' : r.stars >= 1 ? '#ffcc00' : '#ff6633';

      this.add.text(centerX, 60, titleText, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '28px',
        color: titleColor
      }).setOrigin(0.5);

      // Stars
      var starY = 120;
      for (var i = 0; i < 3; i++) {
        var filled = i < r.stars;
        var star = this.add.text(centerX - 40 + i * 40, starY, filled ? '\u2605' : '\u2606', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '32px',
          color: filled ? '#ffcc00' : '#444444'
        }).setOrigin(0.5);

        if (filled) {
          star.setScale(0);
          this.tweens.add({
            targets: star,
            scale: 1,
            duration: 300,
            delay: i * 200,
            ease: 'Back.easeOut'
          });
        }
      }

      // Stats
      var statStyle = {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff'
      };
      var labelStyle = {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#888888'
      };

      var statsY = 190;
      var statSpacing = 50;

      this.add.text(centerX - 100, statsY, 'SCORE', labelStyle).setOrigin(0.5);
      this.add.text(centerX - 100, statsY + 20, String(r.points), statStyle).setOrigin(0.5);

      this.add.text(centerX, statsY, 'WPM', labelStyle).setOrigin(0.5);
      this.add.text(centerX, statsY + 20, String(r.wpm), statStyle).setOrigin(0.5);

      this.add.text(centerX + 100, statsY, 'ACCURACY', labelStyle).setOrigin(0.5);
      this.add.text(centerX + 100, statsY + 20, r.accuracy + '%', statStyle).setOrigin(0.5);

      this.add.text(centerX - 50, statsY + statSpacing + 10, 'WORDS', labelStyle).setOrigin(0.5);
      this.add.text(centerX - 50, statsY + statSpacing + 30, String(r.wordsCompleted), statStyle).setOrigin(0.5);

      this.add.text(centerX + 50, statsY + statSpacing + 10, 'BEST COMBO', labelStyle).setOrigin(0.5);
      this.add.text(centerX + 50, statsY + statSpacing + 30, 'x' + r.maxCombo, statStyle).setOrigin(0.5);

      // Buttons
      var btnY = 400;

      // Retry
      var retryBtn = this.add.image(centerX - 90, btnY, 'button').setInteractive({ useHandCursor: true });
      this.add.text(centerX - 90, btnY, 'RETRY', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#33ff33'
      }).setOrigin(0.5);

      retryBtn.on('pointerover', function () { retryBtn.setTint(0x444444); });
      retryBtn.on('pointerout', function () { retryBtn.clearTint(); });
      retryBtn.on('pointerdown', function () {
        this.scene.start(r.gameSceneKey || 'WhackAMole', { level: r.level, gameKey: r.gameKey });
      }.bind(this));

      // Menu
      var menuBtn = this.add.image(centerX + 90, btnY, 'button').setInteractive({ useHandCursor: true });
      this.add.text(centerX + 90, btnY, 'MENU', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ff6633'
      }).setOrigin(0.5);

      menuBtn.on('pointerover', function () { menuBtn.setTint(0x444444); });
      menuBtn.on('pointerout', function () { menuBtn.clearTint(); });
      menuBtn.on('pointerdown', function () {
        this.scene.start('Menu');
      }.bind(this));

      // Next level (if earned a star and there's a next level)
      if (r.stars >= 1 && r.level < RetroTyping.LevelSystem.getTotalLevels()) {
        var nextBtn = this.add.image(centerX, btnY + 70, 'button-wide').setInteractive({ useHandCursor: true });
        this.add.text(centerX, btnY + 70, 'NEXT LEVEL >', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#ffcc00'
        }).setOrigin(0.5);

        nextBtn.on('pointerover', function () { nextBtn.setTint(0x444444); });
        nextBtn.on('pointerout', function () { nextBtn.clearTint(); });
        nextBtn.on('pointerdown', function () {
          this.scene.start(r.gameSceneKey || 'WhackAMole', { level: r.level + 1, gameKey: r.gameKey });
        }.bind(this));
      }
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.GameOverScene = GameOverScene;
})();
