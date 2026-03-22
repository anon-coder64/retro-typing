// Retro Typing - Main Menu Scene

(function () {
  class MenuScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Menu' });
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var centerX = w / 2;

      // Background
      this.cameras.main.setBackgroundColor('#0a0a2e');

      // Title
      this.add.text(centerX, 60, 'RETRO', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '48px',
        color: '#ff6633'
      }).setOrigin(0.5);

      this.add.text(centerX, 120, 'TYPING', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '48px',
        color: '#33ff33'
      }).setOrigin(0.5);

      // Subtitle
      this.add.text(centerX, 170, 'Type to Play!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#aaaaaa'
      }).setOrigin(0.5);

      // Game list
      var games = [
        { name: 'WHACK-A-MOLE', scene: 'LevelSelect', gameKey: 'whack-a-mole', available: true },
        { name: 'SPACE INVADERS', scene: null, gameKey: 'space-invaders', available: false },
        { name: 'ASTEROIDS', scene: null, gameKey: 'asteroids', available: false },
        { name: 'MISSILE COMMAND', scene: null, gameKey: 'missile-command', available: false },
        { name: 'TAPPER', scene: null, gameKey: 'tapper', available: false }
      ];

      var startY = 230;
      var spacing = 70;

      games.forEach(function (game, i) {
        var y = startY + i * spacing;
        var btn = this.add.image(centerX, y, 'button-wide').setInteractive({ useHandCursor: true });
        var label = this.add.text(centerX, y, game.name, {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: game.available ? '#33ff33' : '#666666'
        }).setOrigin(0.5);

        if (!game.available) {
          this.add.text(centerX + 130, y, 'SOON', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ff6633'
          }).setOrigin(0.5);
        }

        if (game.available) {
          btn.on('pointerover', function () {
            label.setColor('#ffffff');
            btn.setTint(0x444444);
          });
          btn.on('pointerout', function () {
            label.setColor('#33ff33');
            btn.clearTint();
          });
          btn.on('pointerdown', function () {
            this.scene.start(game.scene, { gameKey: game.gameKey, sceneName: 'WhackAMole' });
          }.bind(this));
        }
      }.bind(this));

      // Footer
      this.add.text(centerX, h - 30, 'v1.0 - Learn to type the fun way!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#555555'
      }).setOrigin(0.5);

      // Blinking cursor effect on title
      var cursor = this.add.text(centerX + 140, 120, '_', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '48px',
        color: '#33ff33'
      }).setOrigin(0.5);

      this.tweens.add({
        targets: cursor,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.MenuScene = MenuScene;
})();
