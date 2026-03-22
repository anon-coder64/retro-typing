// Retro Typing - Tapper (Root Beer Tapper)
// Customers slide toward you with words. Type the word to serve them.

(function () {
  class TapperScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Tapper' });
    }

    init(data) {
      this.levelNum = data.level || 1;
      this.gameKey = data.gameKey || 'tapper';
      this.levelConfig = window.RetroTyping.LevelSystem.getLevel(this.levelNum);
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      this.cameras.main.setBackgroundColor('#3a1a0a');

      var laneCount = this.levelConfig.lanes;
      this.laneCount = laneCount;
      this.laneHeight = (h - 100) / laneCount;
      this.laneY = [];

      // Draw bar counters
      var barGfx = this.add.graphics();
      for (var lane = 0; lane < laneCount; lane++) {
        var ly = 80 + lane * this.laneHeight + this.laneHeight / 2;
        this.laneY.push(ly);

        // Bar counter top
        barGfx.fillStyle(0x8B6914, 1);
        barGfx.fillRect(80, ly + 5, w - 160, 8);
        // Bar counter front
        barGfx.fillStyle(0x6B4914, 1);
        barGfx.fillRect(80, ly + 13, w - 160, 12);

        // Lane number
        this.add.text(30, ly, String(lane + 1), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#ffcc00'
        }).setOrigin(0.5);
      }

      // Tapper (player) on the right side
      this.tapper = this.add.image(w - 60, this.laneY[0], 'tapper').setScale(1.5);

      // Core systems
      this.wordEngine = new window.RetroTyping.WordEngine(window.WORD_LIST);
      this.wordEngine.setLevel(this.levelConfig);
      this.inputHandler = new window.RetroTyping.InputHandler(this);
      this.scoreManager = new window.RetroTyping.ScoreManager();
      this.scoreManager.startRound();

      // Game state
      this.lives = 3;
      this.customers = [];
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
        gameSceneKey: 'Tapper'
      });

      // Wire events
      this.inputHandler.events.on('keystroke-hit', this.onKeystrokeHit, this);
      this.inputHandler.events.on('keystroke-miss', this.onKeystrokeMiss, this);
      this.inputHandler.events.on('word-complete', this.onWordComplete, this);
      this.inputHandler.events.on('miss', this.onMiss, this);

      // Spawn timer
      this.spawnTimer = this.time.addEvent({
        delay: this.levelConfig.customerSpawnInterval,
        callback: this.spawnCustomer,
        callbackScope: this,
        loop: true
      });
      this.time.delayedCall(500, this.spawnCustomer, [], this);

      // Level label
      this.add.text(w / 2, 15, 'LEVEL ' + this.levelNum + ' - ' + this.levelConfig.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5).setDepth(100);
    }

    spawnCustomer() {
      if (this.gameOver) return;
      if (this.customers.length >= this.levelConfig.maxCustomers) return;

      var id = ++this.idCounter;
      var lane = Math.floor(Math.random() * this.laneCount);

      var activeFirstLetters = [];
      this.customers.forEach(function (c) { activeFirstLetters.push(c.word[0]); });
      var word = this.wordEngine.getWordAvoidingFirstLetters(activeFirstLetters);

      var x = 100;
      var y = this.laneY[lane];

      var sprite = this.add.image(x, y - 10, 'customer').setScale(1.3);

      // Word chars above customer
      var wordChars = [];
      var container = this.add.container(x, y - 35);
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

      var customer = {
        id: id,
        word: word,
        sprite: sprite,
        wordContainer: container,
        wordChars: wordChars,
        lane: lane,
        x: x
      };
      this.customers.push(customer);
      this.inputHandler.registerTarget(id, word, sprite);
    }

    update(time, delta) {
      if (this.gameOver) return;

      var w = this.cameras.main.width;
      var speed = this.levelConfig.customerSpeed;
      var endX = w - 80;

      for (var i = this.customers.length - 1; i >= 0; i--) {
        var c = this.customers[i];
        c.x += speed * delta * 0.15;
        c.sprite.x = c.x;
        c.wordContainer.x = c.x;

        // Customer reached the end — not served in time
        if (c.x >= endX) {
          this.destroyCustomer(i);
          this.lives--;
          this.scoreManager.recordMiss();
          this.cameras.main.flash(200, 255, 0, 0);

          var hudScene = this.scene.get('HUD');
          if (hudScene) hudScene.setLives(this.lives);

          if (this.lives <= 0) this.endGame();
        }
      }
    }

    onKeystrokeHit(data) {
      var c = this.findCustomer(data.target.id);
      if (!c) return;
      this.scoreManager.recordKeystroke(true);
      if (c.wordChars[data.charIndex]) {
        c.wordChars[data.charIndex].setColor('#33ff33');
      }

      // Move tapper to the customer's lane
      this.tapper.y = this.laneY[c.lane];

      var typed = data.target.word.substring(0, data.target.progress).toUpperCase();
      this.currentWordDisplay.setText(typed);
      this.currentWordDisplay.setColor('#33ff33');
    }

    onKeystrokeMiss(data) {
      var c = this.findCustomer(data.target.id);
      if (!c) return;
      this.scoreManager.recordKeystroke(false);
      c.wordChars.forEach(function (ch) { ch.setColor('#ff3333'); });
      this.time.delayedCall(200, function () {
        c.wordChars.forEach(function (ch) { ch.setColor('#ffffff'); });
      });
      this.currentWordDisplay.setText('MISS!');
      this.currentWordDisplay.setColor('#ff3333');
      this.time.delayedCall(300, function () {
        this.currentWordDisplay.setText('');
      }, [], this);
    }

    onWordComplete(data) {
      var idx = -1;
      var customer = null;
      for (var i = 0; i < this.customers.length; i++) {
        if (this.customers[i].id === data.target.id) {
          idx = i;
          customer = this.customers[i];
          break;
        }
      }
      if (!customer) return;

      this.scoreManager.recordWordComplete(data.target.word);

      // Slide a mug from tapper to customer
      var mug = this.add.image(this.tapper.x - 20, this.laneY[customer.lane] + 2, 'mug').setScale(1.2);
      this.tweens.add({
        targets: mug,
        x: customer.sprite.x,
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: function () {
          // "SERVED!" text
          var served = this.add.text(customer.sprite.x, customer.sprite.y - 30, 'SERVED!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);
          this.tweens.add({
            targets: served,
            alpha: 0, y: served.y - 25,
            duration: 500,
            onComplete: function () { served.destroy(); }
          });

          mug.destroy();
          this.destroyCustomer(idx);
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

    findCustomer(id) {
      for (var i = 0; i < this.customers.length; i++) {
        if (this.customers[i].id === id) return this.customers[i];
      }
      return null;
    }

    destroyCustomer(index) {
      var c = this.customers[index];
      this.inputHandler.removeTarget(c.id);
      c.sprite.destroy();
      c.wordContainer.destroy();
      this.customers.splice(index, 1);
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.inputHandler.enabled = false;
      if (this.spawnTimer) this.spawnTimer.remove(false);

      var results = this.scoreManager.endRound(this.gameKey, this.levelNum, this.levelConfig.targetWPM);
      results.gameSceneKey = 'Tapper';

      this.time.delayedCall(1000, function () {
        this.scene.stop('HUD');
        this.inputHandler.destroy();
        this.scene.start('GameOver', results);
      }, [], this);
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.TapperScene = TapperScene;
})();
