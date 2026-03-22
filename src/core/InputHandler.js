// Retro Typing - Input Handler
// Captures keystrokes and matches them against active word targets
// Emits events: keystroke-hit, keystroke-miss, word-complete, miss

(function () {
  function InputHandler(scene) {
    this.scene = scene;
    this.activeTargets = [];
    this.currentTarget = null;
    this.events = new Phaser.Events.EventEmitter();
    this.enabled = true;

    this._onKeyDown = this.onKeyDown.bind(this);
    scene.input.keyboard.on('keydown', this._onKeyDown);
  }

  InputHandler.prototype.registerTarget = function (id, word, gameObject) {
    this.activeTargets.push({
      id: id,
      word: word.toLowerCase(),
      progress: 0,
      gameObject: gameObject
    });
  };

  InputHandler.prototype.removeTarget = function (id) {
    if (this.currentTarget && this.currentTarget.id === id) {
      this.currentTarget = null;
    }
    this.activeTargets = this.activeTargets.filter(function (t) {
      return t.id !== id;
    });
  };

  InputHandler.prototype.onKeyDown = function (event) {
    if (!this.enabled) return;

    var key = event.key.toLowerCase();

    // Ignore modifier keys, function keys, etc.
    if (key.length !== 1) return;

    if (this.currentTarget === null) {
      // Find targets whose next character matches
      var matches = this.activeTargets.filter(function (t) {
        return t.word[0] === key;
      });

      if (matches.length === 0) {
        this.events.emit('miss', { key: key });
        return;
      }

      // Lock onto first match (FIFO)
      this.currentTarget = matches[0];
      this.currentTarget.progress = 1;
      this.events.emit('keystroke-hit', {
        target: this.currentTarget,
        charIndex: 0
      });

      if (this.currentTarget.word.length === 1) {
        this.events.emit('word-complete', { target: this.currentTarget });
        this.removeTarget(this.currentTarget.id);
        this.currentTarget = null;
      }
    } else {
      var expected = this.currentTarget.word[this.currentTarget.progress];

      if (key === expected) {
        this.currentTarget.progress++;
        this.events.emit('keystroke-hit', {
          target: this.currentTarget,
          charIndex: this.currentTarget.progress - 1
        });

        if (this.currentTarget.progress >= this.currentTarget.word.length) {
          this.events.emit('word-complete', { target: this.currentTarget });
          this.removeTarget(this.currentTarget.id);
          this.currentTarget = null;
        }
      } else {
        this.events.emit('keystroke-miss', {
          target: this.currentTarget,
          expected: expected,
          actual: key
        });
        // Reset progress - player must retype from start
        this.currentTarget.progress = 0;
        this.currentTarget = null;
      }
    }
  };

  InputHandler.prototype.reset = function () {
    this.activeTargets = [];
    this.currentTarget = null;
  };

  InputHandler.prototype.destroy = function () {
    this.scene.input.keyboard.off('keydown', this._onKeyDown);
    this.events.destroy();
    this.activeTargets = [];
    this.currentTarget = null;
  };

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.InputHandler = InputHandler;
})();
