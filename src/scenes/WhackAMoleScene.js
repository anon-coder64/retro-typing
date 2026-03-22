// Retro Typing - Whack-a-Mole Game Scene
// Moles pop up with words. Type the word to whack them before they hide.

(function () {
  class WhackAMoleScene extends Phaser.Scene {
    constructor() {
      super({ key: 'WhackAMole' });
    }

    init(data) {
      this.levelNum = data.level || 1;
      this.gameKey = data.gameKey || 'whack-a-mole';
      this.levelConfig = RetroTyping.LevelSystem.getLevel(this.levelNum);
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      // Background - garden green
      this.cameras.main.setBackgroundColor('#2d5a1e');

      // Draw a dirt area
      var bg = this.add.graphics();
      bg.fillStyle(0x4a7a2e, 1);
      bg.fillRect(0, 0, w, h);
      bg.fillStyle(0x3d6b24, 1);
      bg.fillRect(0, 100, w, h - 100);

      // Set up core systems
      this.wordEngine = new RetroTyping.WordEngine(window.WORD_LIST);
      this.wordEngine.setLevel(this.levelConfig);

      this.inputHandler = new RetroTyping.InputHandler(this);
      this.scoreManager = new RetroTyping.ScoreManager();
      this.scoreManager.startRound();

      // Game state
      this.lives = 3;
      this.activeMoles = new Map();
      this.moleIdCounter = 0;
      this.gameOver = false;

      // 3x3 grid of hole positions
      this.holes = [];
      var gridStartX = w / 2 - 160;
      var gridStartY = 160;
      var colSpacing = 160;
      var rowSpacing = 130;

      for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
          var x = gridStartX + col * colSpacing;
          var y = gridStartY + row * rowSpacing;
          this.holes.push({ x: x, y: y, occupied: false, index: this.holes.length });
        }
      }

      // Draw holes
      this.holeSprites = [];
      this.holes.forEach(function (hole) {
        var holeSprite = this.add.image(hole.x, hole.y + 30, 'hole').setScale(1.2);
        this.holeSprites.push(holeSprite);
      }.bind(this));

      // Mole container (moles go between holes and dirt-front)
      this.moleLayer = this.add.container(0, 0);

      // Dirt front layer (covers bottom of moles)
      this.holes.forEach(function (hole) {
        this.add.image(hole.x, hole.y + 35, 'dirt-front').setScale(1.2);
      }.bind(this));

      // Word display layer (on top of everything)
      this.wordLayer = this.add.container(0, 0);

      // Typing feedback area
      this.currentWordDisplay = this.add.text(w / 2, h - 40, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(100);

      // Launch HUD
      this.scene.launch('HUD', {
        scoreManager: this.scoreManager,
        lives: this.lives,
        roundTime: 60,
        gameSceneKey: 'WhackAMole'
      });

      // Wire up input events
      this.inputHandler.events.on('keystroke-hit', this.onKeystrokeHit, this);
      this.inputHandler.events.on('keystroke-miss', this.onKeystrokeMiss, this);
      this.inputHandler.events.on('word-complete', this.onWordComplete, this);
      this.inputHandler.events.on('miss', this.onMiss, this);

      // Start spawning moles
      this.spawnTimer = this.time.addEvent({
        delay: this.levelConfig.spawnInterval,
        callback: this.spawnMole,
        callbackScope: this,
        loop: true
      });

      // Spawn first mole immediately
      this.time.delayedCall(500, this.spawnMole, [], this);

      // Level indicator
      this.add.text(w / 2, 55, 'LEVEL ' + this.levelNum + ' - ' + this.levelConfig.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5).setDepth(100);

      // Keyboard hint for early levels
      if (this.levelNum <= 2) {
        this.showKeyboardHint();
      }
    }

    spawnMole() {
      if (this.gameOver) return;

      // Find empty holes
      var emptyHoles = this.holes.filter(function (h) { return !h.occupied; });
      if (emptyHoles.length === 0) return;
      if (this.activeMoles.size >= this.levelConfig.maxMoles) return;

      var hole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
      hole.occupied = true;

      var id = ++this.moleIdCounter;

      // Get a word, avoiding duplicate first letters if possible
      var activeFirstLetters = [];
      this.activeMoles.forEach(function (m) {
        activeFirstLetters.push(m.word[0]);
      });
      var word = this.wordEngine.getWordAvoidingFirstLetters(activeFirstLetters);

      // Create mole sprite (starts hidden below hole)
      var moleSprite = this.add.image(hole.x, hole.y + 40, 'mole');
      moleSprite.setScale(1.1);
      this.moleLayer.add(moleSprite);

      // Word text above mole
      var wordChars = [];
      var wordContainer = this.add.container(hole.x, hole.y - 30);
      var totalWidth = word.length * 16;
      var startX = -totalWidth / 2 + 8;

      for (var i = 0; i < word.length; i++) {
        var charText = this.add.text(startX + i * 16, 0, word[i].toUpperCase(), {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5);
        wordContainer.add(charText);
        wordChars.push(charText);
      }
      wordContainer.setAlpha(0);
      this.wordLayer.add(wordContainer);

      // Store mole data
      var moleData = {
        id: id,
        word: word,
        hole: hole,
        moleSprite: moleSprite,
        wordContainer: wordContainer,
        wordChars: wordChars,
        hideTimer: null
      };
      this.activeMoles.set(id, moleData);

      // Register with input handler
      this.inputHandler.registerTarget(id, word, moleSprite);

      // Pop-up animation
      this.tweens.add({
        targets: moleSprite,
        y: hole.y - 5,
        duration: 250,
        ease: 'Back.easeOut',
        onComplete: function () {
          // Show word after mole pops up
          this.tweens.add({
            targets: wordContainer,
            alpha: 1,
            duration: 150
          });
        }.bind(this)
      });

      // Set hide timer
      moleData.hideTimer = this.time.delayedCall(
        this.levelConfig.moleVisibleTime,
        this.hideMole,
        [id, true],
        this
      );
    }

    hideMole(id, escaped) {
      var mole = this.activeMoles.get(id);
      if (!mole) return;

      // Cancel hide timer if whacked
      if (mole.hideTimer) {
        mole.hideTimer.remove(false);
      }

      // Remove from input handler
      this.inputHandler.removeTarget(id);

      // Mark hole as free
      mole.hole.occupied = false;

      // Fade and remove word
      this.tweens.add({
        targets: mole.wordContainer,
        alpha: 0,
        duration: 100
      });

      // Mole goes back down
      this.tweens.add({
        targets: mole.moleSprite,
        y: mole.hole.y + 50,
        duration: 200,
        ease: 'Quad.easeIn',
        onComplete: function () {
          mole.moleSprite.destroy();
          mole.wordContainer.destroy();
        }
      });

      this.activeMoles.delete(id);

      if (escaped) {
        this.lives--;
        this.scoreManager.recordMiss();
        this.updateCurrentWordDisplay('', '#ffffff');

        // Screen flash red
        this.cameras.main.flash(200, 255, 0, 0, false, null, this);

        // Update HUD lives
        var hudScene = this.scene.get('HUD');
        if (hudScene) hudScene.setLives(this.lives);

        if (this.lives <= 0) {
          this.endGame();
        }
      }
    }

    onKeystrokeHit(data) {
      var mole = this.activeMoles.get(data.target.id);
      if (!mole) return;

      this.scoreManager.recordKeystroke(true);

      // Highlight typed character green
      if (mole.wordChars[data.charIndex]) {
        mole.wordChars[data.charIndex].setColor('#33ff33');
      }

      // Mole wobble
      this.tweens.add({
        targets: mole.moleSprite,
        scaleX: 1.2,
        duration: 50,
        yoyo: true
      });

      // Show current typing progress
      var typed = data.target.word.substring(0, data.target.progress).toUpperCase();
      var remaining = data.target.word.substring(data.target.progress).toUpperCase();
      this.updateCurrentWordDisplay(typed, '#33ff33', remaining);
    }

    onKeystrokeMiss(data) {
      var mole = this.activeMoles.get(data.target.id);
      if (!mole) return;

      this.scoreManager.recordKeystroke(false);

      // Flash all chars red then back to white
      mole.wordChars.forEach(function (c) {
        c.setColor('#ff3333');
      });
      this.time.delayedCall(200, function () {
        if (mole.wordChars) {
          mole.wordChars.forEach(function (c) {
            c.setColor('#ffffff');
          });
        }
      });

      // Shake mole
      this.tweens.add({
        targets: mole.moleSprite,
        x: mole.moleSprite.x - 5,
        duration: 30,
        yoyo: true,
        repeat: 3
      });

      this.updateCurrentWordDisplay('MISS!', '#ff3333');
      this.time.delayedCall(300, function () {
        this.updateCurrentWordDisplay('', '#ffffff');
      }, [], this);
    }

    onWordComplete(data) {
      var mole = this.activeMoles.get(data.target.id);
      if (!mole) return;

      this.scoreManager.recordWordComplete(data.target.word);

      // Whack animation - squish mole
      this.tweens.add({
        targets: mole.moleSprite,
        scaleY: 0.3,
        scaleX: 1.5,
        duration: 100,
        onComplete: function () {
          // Show "WHACK!" text
          var whackText = this.add.text(mole.hole.x, mole.hole.y - 50, 'WHACK!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '16px',
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0.5);

          this.tweens.add({
            targets: whackText,
            y: whackText.y - 40,
            alpha: 0,
            duration: 600,
            onComplete: function () { whackText.destroy(); }
          });

          // Points popup
          var points = '+' + (data.target.word.length * 10 * Math.min(this.scoreManager.combo, 5));
          var pointsText = this.add.text(mole.hole.x, mole.hole.y - 20, points, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#33ff33',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);

          this.tweens.add({
            targets: pointsText,
            y: pointsText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: function () { pointsText.destroy(); }
          });

          this.hideMole(data.target.id, false);
        }.bind(this)
      });

      this.updateCurrentWordDisplay('', '#ffffff');
    }

    onMiss(data) {
      this.scoreManager.recordKeystroke(false);
    }

    onTimeUp() {
      this.endGame();
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;

      this.inputHandler.enabled = false;
      if (this.spawnTimer) this.spawnTimer.remove(false);

      // Clear remaining moles
      this.activeMoles.forEach(function (mole, id) {
        this.hideMole(id, false);
      }.bind(this));

      var results = this.scoreManager.endRound(this.gameKey, this.levelNum, this.levelConfig.targetWPM);
      results.gameSceneKey = 'WhackAMole';

      this.time.delayedCall(1000, function () {
        this.scene.stop('HUD');
        this.inputHandler.destroy();
        this.scene.start('GameOver', results);
      }, [], this);
    }

    updateCurrentWordDisplay(text, color, remaining) {
      if (remaining) {
        this.currentWordDisplay.setText(text + remaining);
        // We can't easily color parts differently with a single text object,
        // so just show typed portion effect
        this.currentWordDisplay.setColor(color);
      } else {
        this.currentWordDisplay.setText(text);
        this.currentWordDisplay.setColor(color);
      }
    }

    showKeyboardHint() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var keys = this.levelConfig.allowedKeys;
      var hintText = 'KEYS: ' + keys.join(' ').toUpperCase();

      this.add.text(w / 2, h - 15, hintText, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#555555'
      }).setOrigin(0.5);
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.WhackAMoleScene = WhackAMoleScene;
})();
