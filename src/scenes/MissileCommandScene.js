// Retro Typing - Missile Command
// Missiles rain down on cities. Type the word to intercept before impact.

(function () {
  class MissileCommandScene extends Phaser.Scene {
    constructor() {
      super({ key: 'MissileCommand' });
    }

    init(data) {
      this.levelNum = data.level || 1;
      this.gameKey = data.gameKey || 'missile-command';
      this.levelConfig = window.RetroTyping.LevelSystem.getLevel(this.levelNum);
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      this.cameras.main.setBackgroundColor('#000033');

      // Ground
      this.add.rectangle(w / 2, h - 15, w, 30, 0x333333);

      // Cities
      this.cityCount = this.levelConfig.cities;
      this.citySprites = [];
      var citySpacing = w / (this.cityCount + 1);
      for (var c = 0; c < this.cityCount; c++) {
        var cx = citySpacing * (c + 1);
        var city = this.add.image(cx, h - 35, 'city').setScale(1.5);
        this.citySprites.push({ sprite: city, alive: true, x: cx });
      }

      // Defense turret (center)
      this.turret = this.add.image(w / 2, h - 45, 'turret').setScale(1.5);

      // Core systems
      this.wordEngine = new window.RetroTyping.WordEngine(window.WORD_LIST);
      this.wordEngine.setLevel(this.levelConfig);
      this.inputHandler = new window.RetroTyping.InputHandler(this);
      this.scoreManager = new window.RetroTyping.ScoreManager();
      this.scoreManager.startRound();

      // Game state
      this.missiles = [];
      this.idCounter = 0;
      this.gameOver = false;

      // Typing feedback
      this.currentWordDisplay = this.add.text(w / 2, h - 70, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(100);

      // HUD
      this.scene.launch('HUD', {
        scoreManager: this.scoreManager,
        lives: this.cityCount,
        roundTime: 90,
        gameSceneKey: 'MissileCommand'
      });

      // Wire events
      this.inputHandler.events.on('keystroke-hit', this.onKeystrokeHit, this);
      this.inputHandler.events.on('keystroke-miss', this.onKeystrokeMiss, this);
      this.inputHandler.events.on('word-complete', this.onWordComplete, this);
      this.inputHandler.events.on('miss', this.onMiss, this);

      // Spawn timer
      this.spawnTimer = this.time.addEvent({
        delay: this.levelConfig.missileSpawnInterval,
        callback: this.spawnMissile,
        callbackScope: this,
        loop: true
      });
      this.time.delayedCall(500, this.spawnMissile, [], this);

      // Level label
      this.add.text(w / 2, 15, 'LEVEL ' + this.levelNum + ' - ' + this.levelConfig.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5).setDepth(100);
    }

    spawnMissile() {
      if (this.gameOver) return;
      if (this.missiles.length >= this.levelConfig.maxMissiles) return;

      var w = this.cameras.main.width;
      var id = ++this.idCounter;

      var activeFirstLetters = [];
      this.missiles.forEach(function (m) { activeFirstLetters.push(m.word[0]); });
      var word = this.wordEngine.getWordAvoidingFirstLetters(activeFirstLetters);

      // Pick a random alive city as target
      var aliveCities = this.citySprites.filter(function (c) { return c.alive; });
      if (aliveCities.length === 0) { this.endGame(); return; }
      var targetCity = aliveCities[Math.floor(Math.random() * aliveCities.length)];

      var startX = 50 + Math.random() * (w - 100);
      var startY = -10;

      // Missile trail line
      var trail = this.add.graphics();
      trail.lineStyle(2, 0xff3333, 0.5);

      var sprite = this.add.rectangle(startX, startY, 6, 16, 0xff3333);

      // Word chars
      var wordChars = [];
      var container = this.add.container(startX, startY - 15);
      var totalW = word.length * 12;
      var sx = -totalW / 2 + 6;
      for (var i = 0; i < word.length; i++) {
        var ch = this.add.text(sx + i * 12, 0, word[i].toUpperCase(), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '10px',
          color: '#ff6633',
          stroke: '#000000',
          strokeThickness: 2
        }).setOrigin(0.5);
        container.add(ch);
        wordChars.push(ch);
      }

      var missile = {
        id: id,
        word: word,
        sprite: sprite,
        wordContainer: container,
        wordChars: wordChars,
        trail: trail,
        startX: startX,
        startY: startY,
        targetX: targetCity.x,
        targetY: targetCity.sprite.y,
        targetCityIndex: this.citySprites.indexOf(targetCity),
        progress: 0 // 0 to 1
      };
      this.missiles.push(missile);
      this.inputHandler.registerTarget(id, word, sprite);
    }

    update(time, delta) {
      if (this.gameOver) return;

      var speed = this.levelConfig.missileSpeed;

      for (var i = this.missiles.length - 1; i >= 0; i--) {
        var m = this.missiles[i];
        m.progress += speed * delta * 0.001;

        // Interpolate position
        m.sprite.x = m.startX + (m.targetX - m.startX) * m.progress;
        m.sprite.y = m.startY + (m.targetY - m.startY) * m.progress;
        m.wordContainer.x = m.sprite.x;
        m.wordContainer.y = m.sprite.y - 15;

        // Draw trail
        m.trail.clear();
        m.trail.lineStyle(2, 0xff3333, 0.4);
        m.trail.beginPath();
        m.trail.moveTo(m.startX, Math.max(m.startY, 0));
        m.trail.lineTo(m.sprite.x, m.sprite.y);
        m.trail.strokePath();

        // Hit city
        if (m.progress >= 1) {
          var cityIdx = m.targetCityIndex;
          if (this.citySprites[cityIdx].alive) {
            this.citySprites[cityIdx].alive = false;
            this.citySprites[cityIdx].sprite.setTint(0x333333);

            // Explosion at city
            var boom = this.add.text(m.targetX, m.targetY - 10, 'BOOM!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '14px',
              color: '#ff3333',
              stroke: '#000000',
              strokeThickness: 2
            }).setOrigin(0.5);
            this.tweens.add({
              targets: boom,
              alpha: 0, y: boom.y - 30,
              duration: 600,
              onComplete: function () { boom.destroy(); }
            });

            this.cameras.main.shake(300, 0.02);
          }

          this.destroyMissile(i);
          this.scoreManager.recordMiss();

          // Update HUD with remaining cities
          var alive = this.citySprites.filter(function (c) { return c.alive; }).length;
          var hudScene = this.scene.get('HUD');
          if (hudScene) hudScene.setLives(alive);

          if (alive === 0) this.endGame();
        }
      }
    }

    onKeystrokeHit(data) {
      var m = this.findMissile(data.target.id);
      if (!m) return;
      this.scoreManager.recordKeystroke(true);
      if (m.wordChars[data.charIndex]) {
        m.wordChars[data.charIndex].setColor('#33ff33');
      }
      var typed = data.target.word.substring(0, data.target.progress).toUpperCase();
      this.currentWordDisplay.setText(typed);
      this.currentWordDisplay.setColor('#33ff33');
    }

    onKeystrokeMiss(data) {
      var m = this.findMissile(data.target.id);
      if (!m) return;
      this.scoreManager.recordKeystroke(false);
      m.wordChars.forEach(function (c) { c.setColor('#ff3333'); });
      this.time.delayedCall(200, function () {
        m.wordChars.forEach(function (c) { c.setColor('#ff6633'); });
      });
      this.currentWordDisplay.setText('MISS!');
      this.currentWordDisplay.setColor('#ff3333');
      this.time.delayedCall(300, function () {
        this.currentWordDisplay.setText('');
      }, [], this);
    }

    onWordComplete(data) {
      var idx = -1;
      var missile = null;
      for (var i = 0; i < this.missiles.length; i++) {
        if (this.missiles[i].id === data.target.id) {
          idx = i;
          missile = this.missiles[i];
          break;
        }
      }
      if (!missile) return;

      this.scoreManager.recordWordComplete(data.target.word);

      // Counter-missile from turret
      var mx = missile.sprite.x;
      var my = missile.sprite.y;
      var counter = this.add.rectangle(this.turret.x, this.turret.y - 10, 4, 4, 0x33ff33);
      this.tweens.add({
        targets: counter,
        x: mx,
        y: my,
        duration: 200,
        onComplete: function () {
          counter.destroy();
          // Interception explosion
          var exp = this.add.text(mx, my, 'INTERCEPTED!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#33ff33',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);
          this.tweens.add({
            targets: exp,
            alpha: 0, y: exp.y - 30,
            duration: 500,
            onComplete: function () { exp.destroy(); }
          });
        }.bind(this)
      });

      this.destroyMissile(idx);
      this.currentWordDisplay.setText('');
    }

    onMiss() {
      this.scoreManager.recordKeystroke(false);
    }

    onTimeUp() {
      this.endGame();
    }

    findMissile(id) {
      for (var i = 0; i < this.missiles.length; i++) {
        if (this.missiles[i].id === id) return this.missiles[i];
      }
      return null;
    }

    destroyMissile(index) {
      var m = this.missiles[index];
      this.inputHandler.removeTarget(m.id);
      m.sprite.destroy();
      m.wordContainer.destroy();
      m.trail.destroy();
      this.missiles.splice(index, 1);
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.inputHandler.enabled = false;
      if (this.spawnTimer) this.spawnTimer.remove(false);

      var results = this.scoreManager.endRound(this.gameKey, this.levelNum, this.levelConfig.targetWPM);
      results.gameSceneKey = 'MissileCommand';

      this.time.delayedCall(1000, function () {
        this.scene.stop('HUD');
        this.inputHandler.destroy();
        this.scene.start('GameOver', results);
      }, [], this);
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.MissileCommandScene = MissileCommandScene;
})();
