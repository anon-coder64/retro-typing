// Retro Typing - Asteroids
// Rocks drift toward the ship with words on them. Type to blast.
// Large rocks split into smaller rocks with shorter words.

(function () {
  class AsteroidsScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Asteroids' });
    }

    init(data) {
      this.levelNum = data.level || 1;
      this.gameKey = data.gameKey || 'asteroids';
      this.levelConfig = window.RetroTyping.LevelSystem.getLevel(this.levelNum);
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      this.cameras.main.setBackgroundColor('#000011');

      // Starfield
      for (var i = 0; i < 80; i++) {
        var sx = Math.random() * w;
        var sy = Math.random() * h;
        this.add.rectangle(sx, sy, 1, 1, 0xffffff, Math.random() * 0.6 + 0.2);
      }

      // Ship in center
      this.ship = this.add.image(w / 2, h / 2, 'ship').setScale(1.2);

      // Core systems
      this.wordEngine = new window.RetroTyping.WordEngine(window.WORD_LIST);
      this.wordEngine.setLevel(this.levelConfig);
      this.inputHandler = new window.RetroTyping.InputHandler(this);
      this.scoreManager = new window.RetroTyping.ScoreManager();
      this.scoreManager.startRound();

      // Game state
      this.lives = 3;
      this.asteroids = [];
      this.idCounter = 0;
      this.gameOver = false;

      // Typing feedback
      this.currentWordDisplay = this.add.text(w / 2, h - 20, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(100);

      // HUD
      this.scene.launch('HUD', {
        scoreManager: this.scoreManager,
        lives: this.lives,
        roundTime: 90,
        gameSceneKey: 'Asteroids'
      });

      // Wire events
      this.inputHandler.events.on('keystroke-hit', this.onKeystrokeHit, this);
      this.inputHandler.events.on('keystroke-miss', this.onKeystrokeMiss, this);
      this.inputHandler.events.on('word-complete', this.onWordComplete, this);
      this.inputHandler.events.on('miss', this.onMiss, this);

      // Spawn timer
      this.spawnTimer = this.time.addEvent({
        delay: this.levelConfig.asteroidSpawnInterval,
        callback: this.spawnAsteroid,
        callbackScope: this,
        loop: true
      });

      // Spawn initial asteroids
      this.spawnAsteroid();
      this.time.delayedCall(800, this.spawnAsteroid, [], this);

      // Level label
      this.add.text(w / 2, 15, 'LEVEL ' + this.levelNum + ' - ' + this.levelConfig.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5).setDepth(100);
    }

    spawnAsteroid(specificWord, fromX, fromY) {
      if (this.gameOver) return;
      if (!specificWord && this.asteroids.length >= this.levelConfig.maxAsteroids) return;

      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var id = ++this.idCounter;

      // Get word
      var activeFirstLetters = [];
      this.asteroids.forEach(function (a) { activeFirstLetters.push(a.word[0]); });
      var word = specificWord || this.wordEngine.getWordAvoidingFirstLetters(activeFirstLetters);

      var isLarge = word.length >= 4;
      var scale = isLarge ? 1.5 : 0.9;

      // Spawn from edge, heading toward center area
      var x, y, vx, vy;
      if (fromX !== undefined) {
        x = fromX;
        y = fromY;
      } else {
        var edge = Math.floor(Math.random() * 4);
        if (edge === 0) { x = -20; y = Math.random() * h; }
        else if (edge === 1) { x = w + 20; y = Math.random() * h; }
        else if (edge === 2) { x = Math.random() * w; y = -20; }
        else { x = Math.random() * w; y = h + 20; }
      }

      // Direction toward center with some randomness
      var targetX = w / 2 + (Math.random() - 0.5) * 300;
      var targetY = h / 2 + (Math.random() - 0.5) * 200;
      var angle = Math.atan2(targetY - y, targetX - x);
      var speed = this.levelConfig.asteroidSpeed;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;

      var sprite = this.add.image(x, y, isLarge ? 'asteroid-lg' : 'asteroid-sm').setScale(scale);

      // Word chars
      var wordChars = [];
      var container = this.add.container(x, y - 25 * scale);
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

      var asteroid = {
        id: id,
        word: word,
        sprite: sprite,
        wordContainer: container,
        wordChars: wordChars,
        vx: vx,
        vy: vy,
        isLarge: isLarge,
        rotation: (Math.random() - 0.5) * 0.02
      };
      this.asteroids.push(asteroid);
      this.inputHandler.registerTarget(id, word, sprite);
    }

    update(time, delta) {
      if (this.gameOver) return;

      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var shipX = this.ship.x;
      var shipY = this.ship.y;

      for (var i = this.asteroids.length - 1; i >= 0; i--) {
        var a = this.asteroids[i];
        a.sprite.x += a.vx * delta;
        a.sprite.y += a.vy * delta;
        a.sprite.rotation += a.rotation * delta;
        a.wordContainer.x = a.sprite.x;
        a.wordContainer.y = a.sprite.y - 25;

        // Check collision with ship
        var dx = a.sprite.x - shipX;
        var dy = a.sprite.y - shipY;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 30) {
          this.destroyAsteroid(i, false);
          this.lives--;
          this.scoreManager.recordMiss();
          this.cameras.main.shake(200, 0.02);
          var hudScene = this.scene.get('HUD');
          if (hudScene) hudScene.setLives(this.lives);
          if (this.lives <= 0) this.endGame();
          continue;
        }

        // Off-screen wrap (with margin)
        if (a.sprite.x < -60 || a.sprite.x > w + 60 || a.sprite.y < -60 || a.sprite.y > h + 60) {
          // Re-angle toward center instead of removing
          var angle = Math.atan2(h / 2 - a.sprite.y, w / 2 - a.sprite.x);
          a.vx = Math.cos(angle) * this.levelConfig.asteroidSpeed;
          a.vy = Math.sin(angle) * this.levelConfig.asteroidSpeed;
        }
      }
    }

    onKeystrokeHit(data) {
      var a = this.findAsteroid(data.target.id);
      if (!a) return;
      this.scoreManager.recordKeystroke(true);
      if (a.wordChars[data.charIndex]) {
        a.wordChars[data.charIndex].setColor('#33ff33');
      }
      var typed = data.target.word.substring(0, data.target.progress).toUpperCase();
      this.currentWordDisplay.setText(typed);
      this.currentWordDisplay.setColor('#33ff33');
    }

    onKeystrokeMiss(data) {
      var a = this.findAsteroid(data.target.id);
      if (!a) return;
      this.scoreManager.recordKeystroke(false);
      a.wordChars.forEach(function (c) { c.setColor('#ff3333'); });
      this.time.delayedCall(200, function () {
        a.wordChars.forEach(function (c) { c.setColor('#ffffff'); });
      });
      this.currentWordDisplay.setText('MISS!');
      this.currentWordDisplay.setColor('#ff3333');
      this.time.delayedCall(300, function () {
        this.currentWordDisplay.setText('');
      }, [], this);
    }

    onWordComplete(data) {
      var idx = -1;
      var asteroid = null;
      for (var i = 0; i < this.asteroids.length; i++) {
        if (this.asteroids[i].id === data.target.id) {
          idx = i;
          asteroid = this.asteroids[i];
          break;
        }
      }
      if (!asteroid) return;

      this.scoreManager.recordWordComplete(data.target.word);

      var ax = asteroid.sprite.x;
      var ay = asteroid.sprite.y;
      var wasLarge = asteroid.isLarge;

      // Laser from ship to asteroid
      var laser = this.add.rectangle(this.ship.x, this.ship.y, 3, 3, 0x33ff33);
      this.tweens.add({
        targets: laser,
        x: ax,
        y: ay,
        duration: 150,
        onComplete: function () {
          laser.destroy();

          // Explosion text
          var boom = this.add.text(ax, ay, 'ZAP!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);
          this.tweens.add({
            targets: boom,
            alpha: 0, scaleX: 2, scaleY: 2,
            duration: 400,
            onComplete: function () { boom.destroy(); }
          });
        }.bind(this)
      });

      this.destroyAsteroid(idx, true);

      // Large asteroids split into 2 smaller ones
      if (wasLarge) {
        this.time.delayedCall(200, function () {
          this.spawnAsteroid(null, ax - 20, ay);
          this.spawnAsteroid(null, ax + 20, ay);
        }, [], this);
      }

      this.currentWordDisplay.setText('');
    }

    onMiss() {
      this.scoreManager.recordKeystroke(false);
    }

    onTimeUp() {
      this.endGame();
    }

    findAsteroid(id) {
      for (var i = 0; i < this.asteroids.length; i++) {
        if (this.asteroids[i].id === id) return this.asteroids[i];
      }
      return null;
    }

    destroyAsteroid(index, animate) {
      var a = this.asteroids[index];
      this.inputHandler.removeTarget(a.id);
      if (animate) {
        this.tweens.add({
          targets: [a.sprite],
          alpha: 0, scaleX: 0.1, scaleY: 0.1,
          duration: 200,
          onComplete: function () { a.sprite.destroy(); }
        });
      } else {
        a.sprite.destroy();
      }
      a.wordContainer.destroy();
      this.asteroids.splice(index, 1);
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.inputHandler.enabled = false;
      if (this.spawnTimer) this.spawnTimer.remove(false);

      var results = this.scoreManager.endRound(this.gameKey, this.levelNum, this.levelConfig.targetWPM);
      results.gameSceneKey = 'Asteroids';

      this.time.delayedCall(1000, function () {
        this.scene.stop('HUD');
        this.inputHandler.destroy();
        this.scene.start('GameOver', results);
      }, [], this);
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.AsteroidsScene = AsteroidsScene;
})();
