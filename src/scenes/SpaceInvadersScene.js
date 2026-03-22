// Retro Typing - Space Invaders
// Enemies descend in formation. Type the word above an enemy to shoot it.

(function () {
  class SpaceInvadersScene extends Phaser.Scene {
    constructor() {
      super({ key: 'SpaceInvaders' });
    }

    init(data) {
      this.levelNum = data.level || 1;
      this.gameKey = data.gameKey || 'space-invaders';
      this.levelConfig = window.RetroTyping.LevelSystem.getLevel(this.levelNum);
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      this.cameras.main.setBackgroundColor('#000022');

      // Starfield
      for (var i = 0; i < 60; i++) {
        var sx = Math.random() * w;
        var sy = Math.random() * h;
        var size = Math.random() < 0.3 ? 2 : 1;
        this.add.rectangle(sx, sy, size, size, 0xffffff, Math.random() * 0.5 + 0.3);
      }

      // Player ship at bottom
      this.ship = this.add.image(w / 2, h - 50, 'ship').setScale(1.5);

      // Core systems
      this.wordEngine = new window.RetroTyping.WordEngine(window.WORD_LIST);
      this.wordEngine.setLevel(this.levelConfig);
      this.inputHandler = new window.RetroTyping.InputHandler(this);
      this.scoreManager = new window.RetroTyping.ScoreManager();
      this.scoreManager.startRound();

      // Game state
      this.lives = 3;
      this.invaders = [];
      this.idCounter = 0;
      this.gameOver = false;
      this.direction = 1; // 1 = right, -1 = left
      this.moveTimer = 0;
      this.bullets = [];

      // Spawn invader grid
      this.spawnFormation();

      // Typing feedback
      this.currentWordDisplay = this.add.text(w / 2, h - 15, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(100);

      // HUD
      this.scene.launch('HUD', {
        scoreManager: this.scoreManager,
        lives: this.lives,
        roundTime: 90,
        gameSceneKey: 'SpaceInvaders'
      });

      // Wire events
      this.inputHandler.events.on('keystroke-hit', this.onKeystrokeHit, this);
      this.inputHandler.events.on('keystroke-miss', this.onKeystrokeMiss, this);
      this.inputHandler.events.on('word-complete', this.onWordComplete, this);
      this.inputHandler.events.on('miss', this.onMiss, this);

      // Level label
      this.add.text(w / 2, 15, 'LEVEL ' + this.levelNum + ' - ' + this.levelConfig.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5).setDepth(100);
    }

    spawnFormation() {
      var rows = this.levelConfig.invaderRows;
      var cols = this.levelConfig.invaderCols;
      var startX = 100;
      var startY = 60;
      var spacingX = 80;
      var spacingY = 50;

      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          var x = startX + col * spacingX;
          var y = startY + row * spacingY;
          this.spawnInvader(x, y);
        }
      }
    }

    spawnInvader(x, y) {
      var id = ++this.idCounter;
      var activeFirstLetters = [];
      this.invaders.forEach(function (inv) { activeFirstLetters.push(inv.word[0]); });
      var word = this.wordEngine.getWordAvoidingFirstLetters(activeFirstLetters);

      var sprite = this.add.image(x, y, 'invader').setScale(1.2);

      // Word chars
      var wordChars = [];
      var container = this.add.container(x, y - 20);
      var totalW = word.length * 12;
      var sx = -totalW / 2 + 6;
      for (var i = 0; i < word.length; i++) {
        var ch = this.add.text(sx + i * 12, 0, word[i].toUpperCase(), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5);
        container.add(ch);
        wordChars.push(ch);
      }

      var invader = {
        id: id,
        word: word,
        sprite: sprite,
        wordContainer: container,
        wordChars: wordChars,
        baseX: x,
        baseY: y
      };
      this.invaders.push(invader);
      this.inputHandler.registerTarget(id, word, sprite);
    }

    update(time, delta) {
      if (this.gameOver) return;

      var speed = this.levelConfig.invaderSpeed;
      this.moveTimer += delta;

      // Move invaders
      if (this.moveTimer > 500) {
        this.moveTimer = 0;
        var hitEdge = false;

        this.invaders.forEach(function (inv) {
          inv.sprite.x += this.direction * speed * 30;
          inv.wordContainer.x = inv.sprite.x;
          if (inv.sprite.x > 750 || inv.sprite.x < 50) hitEdge = true;
        }.bind(this));

        if (hitEdge) {
          this.direction *= -1;
          this.invaders.forEach(function (inv) {
            inv.sprite.y += this.levelConfig.invaderDescentRate;
            inv.wordContainer.y = inv.sprite.y - 20;

            // Reached bottom = game over
            if (inv.sprite.y > 520) {
              this.endGame();
            }
          }.bind(this));
        }
      }

      // Update bullets
      for (var i = this.bullets.length - 1; i >= 0; i--) {
        var b = this.bullets[i];
        b.y -= 8;
        if (b.y < -10) {
          b.destroy();
          this.bullets.splice(i, 1);
        }
      }
    }

    onKeystrokeHit(data) {
      var inv = this.findInvader(data.target.id);
      if (!inv) return;

      this.scoreManager.recordKeystroke(true);
      if (inv.wordChars[data.charIndex]) {
        inv.wordChars[data.charIndex].setColor('#33ff33');
      }

      var typed = data.target.word.substring(0, data.target.progress).toUpperCase();
      this.currentWordDisplay.setText(typed);
      this.currentWordDisplay.setColor('#33ff33');
    }

    onKeystrokeMiss(data) {
      var inv = this.findInvader(data.target.id);
      if (!inv) return;

      this.scoreManager.recordKeystroke(false);
      inv.wordChars.forEach(function (c) { c.setColor('#ff3333'); });
      this.time.delayedCall(200, function () {
        inv.wordChars.forEach(function (c) { c.setColor('#ffffff'); });
      });

      this.currentWordDisplay.setText('MISS!');
      this.currentWordDisplay.setColor('#ff3333');
      this.time.delayedCall(300, function () {
        this.currentWordDisplay.setText('');
      }, [], this);
    }

    onWordComplete(data) {
      var inv = this.findInvader(data.target.id);
      if (!inv) return;

      this.scoreManager.recordWordComplete(data.target.word);

      // Fire bullet from ship to invader
      var bullet = this.add.rectangle(this.ship.x, this.ship.y - 20, 4, 12, 0x33ff33);
      this.tweens.add({
        targets: bullet,
        x: inv.sprite.x,
        y: inv.sprite.y,
        duration: 200,
        onComplete: function () {
          bullet.destroy();

          // Explosion
          var boom = this.add.text(inv.sprite.x, inv.sprite.y, 'BOOM', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#ff6633',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);
          this.tweens.add({
            targets: boom,
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 400,
            onComplete: function () { boom.destroy(); }
          });

          this.removeInvader(data.target.id);

          // Check if wave cleared
          if (this.invaders.length === 0) {
            this.time.delayedCall(1000, function () {
              this.spawnFormation();
            }, [], this);
          }
        }.bind(this)
      });

      this.currentWordDisplay.setText('');
    }

    onMiss() {
      this.scoreManager.recordKeystroke(false);
    }

    onTimeUp() {
      this.endGame();
    }

    findInvader(id) {
      for (var i = 0; i < this.invaders.length; i++) {
        if (this.invaders[i].id === id) return this.invaders[i];
      }
      return null;
    }

    removeInvader(id) {
      for (var i = 0; i < this.invaders.length; i++) {
        if (this.invaders[i].id === id) {
          this.inputHandler.removeTarget(id);
          this.invaders[i].sprite.destroy();
          this.invaders[i].wordContainer.destroy();
          this.invaders.splice(i, 1);
          return;
        }
      }
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.inputHandler.enabled = false;

      var results = this.scoreManager.endRound(this.gameKey, this.levelNum, this.levelConfig.targetWPM);
      results.gameSceneKey = 'SpaceInvaders';

      this.time.delayedCall(1000, function () {
        this.scene.stop('HUD');
        this.inputHandler.destroy();
        this.scene.start('GameOver', results);
      }, [], this);
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.SpaceInvadersScene = SpaceInvadersScene;
})();
