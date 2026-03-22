// Retro Typing - Word Engine
// Filters word bank by level config and serves random non-repeating words

(function () {
  function WordEngine(wordList) {
    this.fullList = wordList;
    this.filteredList = [];
    this.recentWords = [];
    this.recentMax = 10;
  }

  WordEngine.prototype.setLevel = function (levelConfig) {
    var allowed = new Set(levelConfig.allowedKeys);
    var minLen = levelConfig.minWordLength;
    var maxLen = levelConfig.maxWordLength;

    this.filteredList = this.fullList.filter(function (word) {
      if (word.length < minLen || word.length > maxLen) return false;
      for (var i = 0; i < word.length; i++) {
        if (!allowed.has(word[i].toLowerCase())) return false;
      }
      return true;
    });

    // Deduplicate
    this.filteredList = Array.from(new Set(this.filteredList));
    this.recentWords = [];

    if (this.filteredList.length === 0) {
      console.warn('WordEngine: no words match level config, falling back to allowed keys as single chars');
      this.filteredList = levelConfig.allowedKeys.slice();
    }
  };

  WordEngine.prototype.getWord = function () {
    var available = this.filteredList.filter(function (w) {
      return this.recentWords.indexOf(w) === -1;
    }.bind(this));

    // If we've exhausted non-recent words, allow repeats
    if (available.length === 0) {
      available = this.filteredList.slice();
      this.recentWords = [];
    }

    var word = available[Math.floor(Math.random() * available.length)];
    this.recentWords.push(word);
    if (this.recentWords.length > this.recentMax) {
      this.recentWords.shift();
    }
    return word;
  };

  WordEngine.prototype.getWordAvoidingFirstLetters = function (avoidLetters) {
    var avoid = new Set(avoidLetters);
    var available = this.filteredList.filter(function (w) {
      return !avoid.has(w[0]) && this.recentWords.indexOf(w) === -1;
    }.bind(this));

    if (available.length === 0) {
      // Fall back to just avoiding recent words
      return this.getWord();
    }

    var word = available[Math.floor(Math.random() * available.length)];
    this.recentWords.push(word);
    if (this.recentWords.length > this.recentMax) {
      this.recentWords.shift();
    }
    return word;
  };

  WordEngine.prototype.getAvailableCount = function () {
    return this.filteredList.length;
  };

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.WordEngine = WordEngine;
})();
