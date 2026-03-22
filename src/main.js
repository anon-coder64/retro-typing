// Retro Typing - Entry Point
// Creates the Phaser game instance

(function () {
  window.addEventListener('load', function () {
    var game = new Phaser.Game(RetroTyping.config);
    window.RetroTyping.game = game;
  });
})();
