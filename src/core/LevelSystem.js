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
      // Whack-a-Mole
      spawnInterval: 4500,
      moleVisibleTime: 8000,
      maxMoles: 1,
      // Space Invaders
      invaderRows: 2,
      invaderCols: 3,
      invaderSpeed: 0.15,
      invaderDescentRate: 10,
      // Asteroids
      asteroidSpeed: 0.2,
      maxAsteroids: 1,
      asteroidSpawnInterval: 6000,
      // Missile Command
      missileSpeed: 0.15,
      maxMissiles: 1,
      missileSpawnInterval: 6000,
      cities: 4,
      // Tapper
      customerSpeed: 0.2,
      maxCustomers: 1,
      customerSpawnInterval: 5000,
      lanes: 3,
      // Rampage
      rampageBuildingsPerBlock: 3,
      rampageBlocks: 3,
      rampageRoarCharge: 4
    },
    {
      level: 2,
      name: 'Home Row',
      allowedKeys: 'asdfghjkl'.split(''),
      minWordLength: 2,
      maxWordLength: 4,
      targetWPM: 10,
      description: 'Longer home row words',
      spawnInterval: 4000,
      moleVisibleTime: 7000,
      maxMoles: 2,
      invaderRows: 2,
      invaderCols: 4,
      invaderSpeed: 0.2,
      invaderDescentRate: 12,
      asteroidSpeed: 0.25,
      maxAsteroids: 2,
      asteroidSpawnInterval: 5000,
      missileSpeed: 0.2,
      maxMissiles: 1,
      missileSpawnInterval: 5000,
      cities: 4,
      customerSpeed: 0.25,
      maxCustomers: 1,
      customerSpawnInterval: 4500,
      lanes: 3,
      rampageBuildingsPerBlock: 4,
      rampageBlocks: 4,
      rampageRoarCharge: 5
    },
    {
      level: 3,
      name: 'Top Row',
      allowedKeys: 'asdfghjklqwertyuiop'.split(''),
      minWordLength: 3,
      maxWordLength: 5,
      targetWPM: 15,
      description: 'Adding the top row',
      spawnInterval: 3500,
      moleVisibleTime: 6000,
      maxMoles: 2,
      invaderRows: 3,
      invaderCols: 5,
      invaderSpeed: 0.3,
      invaderDescentRate: 15,
      asteroidSpeed: 0.35,
      maxAsteroids: 3,
      asteroidSpawnInterval: 4000,
      missileSpeed: 0.3,
      maxMissiles: 2,
      missileSpawnInterval: 4000,
      cities: 5,
      customerSpeed: 0.35,
      maxCustomers: 2,
      customerSpawnInterval: 3500,
      lanes: 4,
      rampageBuildingsPerBlock: 4,
      rampageBlocks: 5,
      rampageRoarCharge: 5
    },
    {
      level: 4,
      name: 'All Letters',
      allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      minWordLength: 3,
      maxWordLength: 6,
      targetWPM: 20,
      description: 'The whole alphabet',
      spawnInterval: 2800,
      moleVisibleTime: 5000,
      maxMoles: 3,
      invaderRows: 3,
      invaderCols: 6,
      invaderSpeed: 0.4,
      invaderDescentRate: 18,
      asteroidSpeed: 0.45,
      maxAsteroids: 4,
      asteroidSpawnInterval: 3500,
      missileSpeed: 0.4,
      maxMissiles: 2,
      missileSpawnInterval: 3500,
      cities: 6,
      customerSpeed: 0.45,
      maxCustomers: 2,
      customerSpawnInterval: 3000,
      lanes: 4,
      rampageBuildingsPerBlock: 5,
      rampageBlocks: 5,
      rampageRoarCharge: 6
    },
    {
      level: 5,
      name: 'Master',
      allowedKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      minWordLength: 4,
      maxWordLength: 7,
      targetWPM: 25,
      description: 'Long words, fast speed',
      spawnInterval: 2000,
      moleVisibleTime: 4000,
      maxMoles: 3,
      invaderRows: 4,
      invaderCols: 7,
      invaderSpeed: 0.55,
      invaderDescentRate: 22,
      asteroidSpeed: 0.6,
      maxAsteroids: 5,
      asteroidSpawnInterval: 2800,
      missileSpeed: 0.55,
      maxMissiles: 3,
      missileSpawnInterval: 2800,
      cities: 6,
      customerSpeed: 0.6,
      maxCustomers: 3,
      customerSpawnInterval: 2200,
      lanes: 4,
      rampageBuildingsPerBlock: 6,
      rampageBlocks: 6,
      rampageRoarCharge: 6
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
