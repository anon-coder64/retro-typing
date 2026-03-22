// Retro Typing - Level System
// Defines level configs: allowed keys, word lengths, speed targets, and game-specific params

(function () {
  const LEVELS = [
    {
      level: 1,
      name: 'Home Row Start',
      allowedKeys: 'asdfghjkl'.split(''),
      minWordLength: 2,
      maxWordLength: 3,
      targetWPM: 5,
      description: 'Home row keys',
      // Whack-a-Mole specific
      spawnInterval: 3500,
      moleVisibleTime: 6000,
      maxMoles: 1
    },
    {
      level: 2,
      name: 'Home Row',
      allowedKeys: 'asdfghjkl'.split(''),
      minWordLength: 2,
      maxWordLength: 4,
      targetWPM: 10,
      description: 'Longer home row words',
      spawnInterval: 3000,
      moleVisibleTime: 5000,
      maxMoles: 2
    },
    {
      level: 3,
      name: 'Top Row',
      allowedKeys: 'asdfghjklqwertyuiop'.split(''),
      minWordLength: 3,
      maxWordLength: 5,
      targetWPM: 15,
      description: 'Adding the top row',
      spawnInterval: 2500,
      moleVisibleTime: 4500,
      maxMoles: 2
    },
    {
      level: 4,
      name: 'All Letters',
      allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      minWordLength: 3,
      maxWordLength: 6,
      targetWPM: 20,
      description: 'The whole alphabet',
      spawnInterval: 2000,
      moleVisibleTime: 4000,
      maxMoles: 3
    },
    {
      level: 5,
      name: 'Master',
      allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      minWordLength: 4,
      maxWordLength: 7,
      targetWPM: 25,
      description: 'Long words, fast speed',
      spawnInterval: 1500,
      moleVisibleTime: 3500,
      maxMoles: 3
    }
  ];

  const LevelSystem = {
    LEVELS: LEVELS,

    getLevel: function (n) {
      return LEVELS[Math.min(n, LEVELS.length) - 1] || LEVELS[0];
    },

    isUnlocked: function (gameKey, level) {
      if (level <= 1) return true;
      var scores = JSON.parse(localStorage.getItem('retro-typing-scores') || '{}');
      var gameScores = scores[gameKey] || {};
      var prev = gameScores[String(level - 1)];
      return prev && prev.bestStars >= 1;
    },

    getTotalLevels: function () {
      return LEVELS.length;
    }
  };

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.LevelSystem = LevelSystem;
})();
