// Retro Typing - Phaser Game Configuration

(function () {
  window.RetroTyping = window.RetroTyping || {};

  window.RetroTyping.config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#0a0a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
      keyboard: {
        target: window
      }
    },
    scene: [
      window.RetroTyping.BootScene,
      window.RetroTyping.MenuScene,
      window.RetroTyping.LevelSelectScene,
      window.RetroTyping.HUDScene,
      window.RetroTyping.GameOverScene,
      window.RetroTyping.WhackAMoleScene
    ]
  };
})();
