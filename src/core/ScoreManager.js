// Retro Typing - Score Manager
// Tracks points, WPM, accuracy per round; persists high scores to localStorage

(function () {
  var STORAGE_KEY = 'retro-typing-scores';

  function ScoreManager() {
    this.wordsCompleted = 0;
    this.totalCharsTyped = 0;
    this.correctChars = 0;
    this.points = 0;
    this.startTime = null;
    this.combo = 0;
    this.maxCombo = 0;
    // Active typing time tracking — only counts time between keystrokes
    this.activeTypingTime = 0;   // accumulated ms of active typing
    this.lastKeystrokeTime = null; // timestamp of last keystroke
    this.idleThreshold = 2000;   // ms — gaps longer than this are considered idle
  }

  ScoreManager.prototype.startRound = function () {
    this.wordsCompleted = 0;
    this.totalCharsTyped = 0;
    this.correctChars = 0;
    this.points = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.startTime = Date.now();
    this.activeTypingTime = 0;
    this.lastKeystrokeTime = null;
  };

  ScoreManager.prototype.recordKeystroke = function (correct) {
    var now = Date.now();

    // Track active typing time: if the gap since last keystroke is short,
    // count it as active typing. Long gaps are idle (waiting for targets).
    if (this.lastKeystrokeTime !== null) {
      var gap = now - this.lastKeystrokeTime;
      if (gap < this.idleThreshold) {
        this.activeTypingTime += gap;
      }
    }
    // Always count a small base amount for each keystroke (the keystroke itself)
    this.activeTypingTime += 50;
    this.lastKeystrokeTime = now;

    this.totalCharsTyped++;
    if (correct) {
      this.correctChars++;
    }
  };

  ScoreManager.prototype.recordWordComplete = function (word) {
    this.wordsCompleted++;
    this.combo++;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;

    var accuracy = this.getAccuracy();
    var comboMultiplier = Math.min(this.combo, 5);
    this.points += word.length * 10 * comboMultiplier;

    // Accuracy bonus
    if (accuracy >= 0.95) {
      this.points += 50;
    }
  };

  ScoreManager.prototype.recordMiss = function () {
    this.combo = 0;
  };

  ScoreManager.prototype.getWPM = function () {
    if (!this.startTime || this.activeTypingTime === 0) return 0;
    // Use active typing time instead of wall-clock time
    // This way idle time waiting for targets doesn't tank the WPM
    var activeMinutes = this.activeTypingTime / 60000;
    if (activeMinutes < 0.02) return 0; // avoid wild numbers early
    return Math.round((this.correctChars / 5) / activeMinutes);
  };

  ScoreManager.prototype.getAccuracy = function () {
    if (this.totalCharsTyped === 0) return 1;
    return this.correctChars / this.totalCharsTyped;
  };

  ScoreManager.prototype.endRound = function (gameKey, level, targetWPM) {
    var wpm = this.getWPM();
    var accuracy = this.getAccuracy();
    var stars = 0;

    if (this.wordsCompleted >= 3) stars = 1; // completed enough words
    if (stars >= 1 && wpm >= targetWPM) stars = 2;
    if (stars >= 2 && accuracy >= 0.9) stars = 3;

    var result = {
      points: this.points,
      wpm: wpm,
      accuracy: Math.round(accuracy * 100),
      stars: stars,
      wordsCompleted: this.wordsCompleted,
      maxCombo: this.maxCombo,
      gameKey: gameKey,
      level: level
    };

    // Persist best scores
    this._saveHighScore(gameKey, level, result);

    return result;
  };

  ScoreManager.prototype._saveHighScore = function (gameKey, level, result) {
    var scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!scores[gameKey]) scores[gameKey] = {};
    var prev = scores[gameKey][String(level)] || { bestPoints: 0, bestWPM: 0, bestStars: 0 };

    scores[gameKey][String(level)] = {
      bestPoints: Math.max(prev.bestPoints, result.points),
      bestWPM: Math.max(prev.bestWPM, result.wpm),
      bestStars: Math.max(prev.bestStars, result.stars)
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  };

  ScoreManager.prototype.getHighScores = function (gameKey) {
    var scores = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return scores[gameKey] || {};
  };

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.ScoreManager = ScoreManager;
})();
