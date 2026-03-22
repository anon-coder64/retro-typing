// Retro Typing - Rampage
// Play as a monster smashing buildings. Type the word on a building to destroy it.
// Clear all buildings on a block, then advance to the next block. No time pressure.

(function () {
  var BUILDING_COLORS = [0x4466aa, 0x556688, 0x445577, 0x667799, 0x3355aa, 0x557799];

  class RampageScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Rampage' });
    }

    init(data) {
      this.levelNum = data.level || 1;
      this.gameKey = data.gameKey || 'rampage';
      this.levelConfig = window.RetroTyping.LevelSystem.getLevel(this.levelNum);
    }

    create() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;

      this.cameras.main.setBackgroundColor('#1a0a2e');

      // Skyline gradient
      var sky = this.add.graphics();
      sky.fillStyle(0x1a0a2e, 1);
      sky.fillRect(0, 0, w, h);
      sky.fillStyle(0x2a1a3e, 1);
      sky.fillRect(0, h * 0.4, w, h * 0.6);

      // Stars in the sky
      for (var s = 0; s < 30; s++) {
        this.add.rectangle(
          Math.random() * w, Math.random() * h * 0.5,
          1, 1, 0xffffff, Math.random() * 0.5 + 0.3
        );
      }

      // Ground
      this.groundY = h - 40;
      this.add.rectangle(w / 2, this.groundY + 20, w, 40, 0x333333);
      // Road markings
      for (var r = 0; r < w; r += 60) {
        this.add.rectangle(r + 15, this.groundY + 20, 20, 3, 0xffcc00, 0.6);
      }

      // Core systems
      this.wordEngine = new window.RetroTyping.WordEngine(window.WORD_LIST);
      this.wordEngine.setLevel(this.levelConfig);
      this.inputHandler = new window.RetroTyping.InputHandler(this);
      this.scoreManager = new window.RetroTyping.ScoreManager();
      this.scoreManager.startRound();

      // Game state
      this.buildings = [];
      this.idCounter = 0;
      this.gameOver = false;
      this.blocksCleared = 0;
      this.totalBlocks = this.levelConfig.rampageBlocks;
      this.buildingsPerBlock = this.levelConfig.rampageBuildingsPerBlock;
      this.roarReady = false;
      this.roarChargeCount = 0;
      this.roarChargeNeeded = this.levelConfig.rampageRoarCharge;

      // Monster on the left
      this.monster = this.add.image(80, this.groundY - 35, 'monster').setScale(3);
      this.monsterBaseY = this.groundY - 35;

      // Idle bounce animation
      this.tweens.add({
        targets: this.monster,
        y: this.monsterBaseY - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // Typing feedback
      this.currentWordDisplay = this.add.text(w / 2, h - 15, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5).setDepth(100);

      // Block progress
      this.blockText = this.add.text(w / 2, 55, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#aaaaaa'
      }).setOrigin(0.5).setDepth(100);

      // Roar meter
      this.roarText = this.add.text(15, h - 60, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ff6633'
      }).setDepth(100);

      // HUD — use blocks remaining as "lives" display (repurpose)
      this.scene.launch('HUD', {
        scoreManager: this.scoreManager,
        lives: this.totalBlocks,
        roundTime: 120,
        gameSceneKey: 'Rampage'
      });

      // Wire events
      this.inputHandler.events.on('keystroke-hit', this.onKeystrokeHit, this);
      this.inputHandler.events.on('keystroke-miss', this.onKeystrokeMiss, this);
      this.inputHandler.events.on('word-complete', this.onWordComplete, this);
      this.inputHandler.events.on('miss', this.onMiss, this);

      // Spawn first block
      this.spawnBlock();

      // Level label
      this.add.text(w / 2, 15, 'LEVEL ' + this.levelNum + ' - ' + this.levelConfig.name, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#ffcc00'
      }).setOrigin(0.5).setDepth(100);

      if (this.levelNum <= 2) {
        this.showKeyboardHint();
      }
    }

    spawnBlock() {
      var w = this.cameras.main.width;
      var count = this.buildingsPerBlock;
      var startX = 180;
      var spacing = (w - startX - 40) / count;

      // Get first letters of all words we'll use, to avoid duplicates
      var activeFirstLetters = [];

      for (var i = 0; i < count; i++) {
        var id = ++this.idCounter;
        var word = this.wordEngine.getWordAvoidingFirstLetters(activeFirstLetters);
        activeFirstLetters.push(word[0]);

        // Building height based on word length
        var minH = 60;
        var maxH = 200;
        var heightRatio = (word.length - 2) / 5; // 2-letter = short, 7-letter = tall
        var bHeight = minH + (maxH - minH) * Math.min(heightRatio, 1);
        var bWidth = spacing - 10;
        var bx = startX + i * spacing + spacing / 2;
        var by = this.groundY;

        var color = BUILDING_COLORS[i % BUILDING_COLORS.length];

        // Building sprite (drawn with graphics)
        var gfx = this.add.graphics();
        gfx.fillStyle(color, 1);
        gfx.fillRect(bx - bWidth / 2, by - bHeight, bWidth, bHeight);

        // Windows
        gfx.fillStyle(0xffff66, 0.8);
        var windowRows = Math.floor(bHeight / 25);
        var windowCols = Math.max(1, Math.floor(bWidth / 20));
        var wxStart = bx - bWidth / 2 + 8;
        var wxSpacing = (bWidth - 16) / Math.max(windowCols, 1);
        for (var wr = 0; wr < windowRows; wr++) {
          for (var wc = 0; wc < windowCols; wc++) {
            if (Math.random() > 0.3) { // Some windows dark
              gfx.fillRect(
                wxStart + wc * wxSpacing,
                by - bHeight + 10 + wr * 25,
                8, 12
              );
            }
          }
        }

        // Word chars on the building face
        var wordChars = [];
        var container = this.add.container(bx, by - bHeight / 2);
        var totalTextW = word.length * 14;
        var sx = -totalTextW / 2 + 7;
        for (var c = 0; c < word.length; c++) {
          var ch = this.add.text(sx + c * 14, 0, word[c].toUpperCase(), {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
          }).setOrigin(0.5);
          container.add(ch);
          wordChars.push(ch);
        }

        var building = {
          id: id,
          word: word,
          gfx: gfx,
          wordContainer: container,
          wordChars: wordChars,
          x: bx,
          y: by,
          height: bHeight,
          width: bWidth
        };
        this.buildings.push(building);
        this.inputHandler.registerTarget(id, word, gfx);
      }

      this.updateBlockText();
    }

    onKeystrokeHit(data) {
      // Check if this is a ROAR target
      if (data.target.id === 'roar') {
        this.currentWordDisplay.setText(
          data.target.word.substring(0, data.target.progress).toUpperCase()
        );
        this.currentWordDisplay.setColor('#ff6633');
        return;
      }

      var b = this.findBuilding(data.target.id);
      if (!b) return;

      this.scoreManager.recordKeystroke(true);
      if (b.wordChars[data.charIndex]) {
        b.wordChars[data.charIndex].setColor('#33ff33');
      }

      // Monster reaches toward building
      this.tweens.add({
        targets: this.monster,
        scaleX: 3.3,
        duration: 50,
        yoyo: true
      });

      // Small crack effect on building
      var crackX = b.x + (Math.random() - 0.5) * b.width * 0.5;
      var crackY = b.y - Math.random() * b.height;
      var crack = this.add.text(crackX, crackY, '*', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#ffcc00'
      }).setOrigin(0.5);
      this.time.delayedCall(500, function () { crack.destroy(); });

      var typed = data.target.word.substring(0, data.target.progress).toUpperCase();
      this.currentWordDisplay.setText(typed);
      this.currentWordDisplay.setColor('#33ff33');
    }

    onKeystrokeMiss(data) {
      if (data.target.id === 'roar') return;

      var b = this.findBuilding(data.target.id);
      if (!b) return;

      this.scoreManager.recordKeystroke(false);
      b.wordChars.forEach(function (c) { c.setColor('#ff3333'); });
      this.time.delayedCall(200, function () {
        b.wordChars.forEach(function (c) { c.setColor('#ffffff'); });
      });

      this.currentWordDisplay.setText('MISS!');
      this.currentWordDisplay.setColor('#ff3333');
      this.time.delayedCall(300, function () {
        this.currentWordDisplay.setText('');
      }, [], this);
    }

    onWordComplete(data) {
      // ROAR special attack
      if (data.target.id === 'roar') {
        this.executeRoar();
        return;
      }

      var idx = -1;
      var building = null;
      for (var i = 0; i < this.buildings.length; i++) {
        if (this.buildings[i].id === data.target.id) {
          idx = i;
          building = this.buildings[i];
          break;
        }
      }
      if (!building) return;

      this.scoreManager.recordWordComplete(data.target.word);

      // SMASH animation
      this.cameras.main.shake(200, 0.015);

      // Monster punch
      this.tweens.add({
        targets: this.monster,
        x: building.x - 40,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      });

      // "SMASH!" text
      var smashText = this.add.text(building.x, building.y - building.height - 10, 'SMASH!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '18px',
        color: '#ff6633',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({
        targets: smashText,
        y: smashText.y - 40,
        alpha: 0,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 600,
        onComplete: function () { smashText.destroy(); }
      });

      // Points popup
      var pts = '+' + (data.target.word.length * 10 * Math.min(this.scoreManager.combo, 5));
      var ptsText = this.add.text(building.x, building.y - building.height / 2, pts, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#33ff33',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);
      this.tweens.add({
        targets: ptsText,
        y: ptsText.y - 30, alpha: 0,
        duration: 800,
        onComplete: function () { ptsText.destroy(); }
      });

      // Rubble particles
      for (var p = 0; p < 6; p++) {
        var rubble = this.add.rectangle(
          building.x + (Math.random() - 0.5) * building.width,
          building.y - building.height * 0.3,
          4 + Math.random() * 6,
          4 + Math.random() * 6,
          0x888888
        );
        this.tweens.add({
          targets: rubble,
          x: rubble.x + (Math.random() - 0.5) * 80,
          y: this.groundY + Math.random() * 10,
          alpha: 0,
          duration: 400 + Math.random() * 300,
          onComplete: function () { rubble.destroy(); }
        });
      }

      // Building collapse animation
      this.inputHandler.removeTarget(building.id);
      this.tweens.add({
        targets: building.wordContainer,
        alpha: 0,
        duration: 100
      });
      this.tweens.add({
        targets: building.gfx,
        scaleY: 0.05,
        alpha: 0,
        duration: 300,
        ease: 'Quad.easeIn',
        onComplete: function () {
          building.gfx.destroy();
          building.wordContainer.destroy();
        }
      });

      this.buildings.splice(idx, 1);

      // Charge roar meter
      this.roarChargeCount++;
      this.updateRoarMeter();

      // Block cleared?
      if (this.buildings.length === 0) {
        this.blocksCleared++;
        this.updateBlockText();

        // Update HUD "lives" to show blocks remaining
        var hudScene = this.scene.get('HUD');
        if (hudScene) hudScene.setLives(this.totalBlocks - this.blocksCleared);

        if (this.blocksCleared >= this.totalBlocks) {
          this.endGame();
        } else {
          // Advance to next block
          var advanceText = this.add.text(
            this.cameras.main.width / 2, this.cameras.main.height / 2,
            'BLOCK CLEARED!', {
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '24px',
              color: '#ffcc00',
              stroke: '#000000',
              strokeThickness: 4
            }
          ).setOrigin(0.5).setDepth(200);

          this.tweens.add({
            targets: advanceText,
            alpha: 0,
            y: advanceText.y - 30,
            duration: 1000,
            onComplete: function () { advanceText.destroy(); }
          });

          this.time.delayedCall(800, this.spawnBlock, [], this);
        }
      }

      this.currentWordDisplay.setText('');
    }

    onMiss() {
      this.scoreManager.recordKeystroke(false);
    }

    onTimeUp() {
      this.endGame();
    }

    executeRoar() {
      this.roarReady = false;
      this.roarChargeCount = 0;
      this.inputHandler.removeTarget('roar');
      this.updateRoarMeter();

      // ROAR effect — destroy all buildings on screen
      var scene = this;

      // Monster roar animation
      var roarLabel = this.add.text(
        this.monster.x + 40, this.monsterBaseY - 60, 'ROAAAR!', {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '28px',
          color: '#ff3333',
          stroke: '#000000',
          strokeThickness: 4
        }
      ).setOrigin(0.5).setDepth(200);

      this.tweens.add({
        targets: roarLabel,
        scaleX: 1.5, scaleY: 1.5, alpha: 0,
        duration: 800,
        onComplete: function () { roarLabel.destroy(); }
      });

      this.cameras.main.shake(500, 0.03);

      // Destroy all remaining buildings with staggered explosions
      var delay = 0;
      var buildingsCopy = this.buildings.slice();
      buildingsCopy.forEach(function (b) {
        scene.time.delayedCall(delay, function () {
          scene.inputHandler.removeTarget(b.id);
          scene.scoreManager.recordWordComplete(b.word);

          // Explosion
          var boom = scene.add.text(b.x, b.y - b.height / 2, 'BOOM!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: '#ff6633',
            stroke: '#000000',
            strokeThickness: 2
          }).setOrigin(0.5);
          scene.tweens.add({
            targets: boom,
            alpha: 0, scaleX: 2, scaleY: 2,
            duration: 400,
            onComplete: function () { boom.destroy(); }
          });

          scene.tweens.add({
            targets: b.gfx,
            scaleY: 0.05, alpha: 0,
            duration: 200,
            onComplete: function () { b.gfx.destroy(); }
          });
          b.wordContainer.destroy();
        });
        delay += 150;
      });

      this.buildings = [];

      // After all explosions, advance
      this.time.delayedCall(delay + 500, function () {
        this.blocksCleared++;
        this.updateBlockText();

        var hudScene = this.scene.get('HUD');
        if (hudScene) hudScene.setLives(this.totalBlocks - this.blocksCleared);

        if (this.blocksCleared >= this.totalBlocks) {
          this.endGame();
        } else {
          this.spawnBlock();
        }
      }, [], this);
    }

    updateRoarMeter() {
      if (this.roarChargeCount >= this.roarChargeNeeded && !this.roarReady) {
        this.roarReady = true;
        // Register ROAR as a special target
        this.inputHandler.registerTarget('roar', 'roar', null);
        this.roarText.setText('ROAR READY! Type ROAR');
        this.roarText.setColor('#ff3333');

        // Flash effect
        this.tweens.add({
          targets: this.roarText,
          alpha: 0.3,
          duration: 300,
          yoyo: true,
          repeat: 5
        });
      } else if (!this.roarReady) {
        var pct = Math.min(this.roarChargeCount / this.roarChargeNeeded, 1);
        var bars = Math.floor(pct * 10);
        var meter = '';
        for (var i = 0; i < 10; i++) {
          meter += i < bars ? '\u2588' : '\u2591';
        }
        this.roarText.setText('ROAR ' + meter);
        this.roarText.setColor('#ff6633');
      } else {
        this.roarText.setText('ROAR READY! Type ROAR');
      }
    }

    updateBlockText() {
      this.blockText.setText(
        'BLOCK ' + (this.blocksCleared + 1) + ' / ' + this.totalBlocks
      );
    }

    findBuilding(id) {
      for (var i = 0; i < this.buildings.length; i++) {
        if (this.buildings[i].id === id) return this.buildings[i];
      }
      return null;
    }

    endGame() {
      if (this.gameOver) return;
      this.gameOver = true;
      this.inputHandler.enabled = false;

      var results = this.scoreManager.endRound(this.gameKey, this.levelNum, this.levelConfig.targetWPM);
      results.gameSceneKey = 'Rampage';

      // Victory roar if all blocks cleared
      if (this.blocksCleared >= this.totalBlocks) {
        var victory = this.add.text(
          this.cameras.main.width / 2, this.cameras.main.height / 2,
          'CITY DESTROYED!', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '22px',
            color: '#ff3333',
            stroke: '#000000',
            strokeThickness: 4
          }
        ).setOrigin(0.5).setDepth(200);
        this.tweens.add({
          targets: victory,
          scaleX: 1.2, scaleY: 1.2,
          duration: 300,
          yoyo: true,
          repeat: 2
        });
      }

      this.time.delayedCall(1500, function () {
        this.scene.stop('HUD');
        this.inputHandler.destroy();
        this.scene.start('GameOver', results);
      }, [], this);
    }

    showKeyboardHint() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      var keys = this.levelConfig.allowedKeys;
      this.add.text(w / 2, h - 30, 'KEYS: ' + keys.join(' ').toUpperCase(), {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#555555'
      }).setOrigin(0.5);
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.RampageScene = RampageScene;
})();
