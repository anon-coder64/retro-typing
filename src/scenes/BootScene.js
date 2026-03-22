// Retro Typing - Boot Scene
// Preloads shared assets and transitions to the menu

(function () {
  class BootScene extends Phaser.Scene {
    constructor() {
      super({ key: 'Boot' });
    }

    preload() {
      var w = this.cameras.main.width;
      var h = this.cameras.main.height;
      this.loadingText = this.add.text(w / 2, h / 2, 'LOADING...', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '20px',
        color: '#33ff33'
      }).setOrigin(0.5);
    }

    create() {
      this.generateTextures();
      this.scene.start('Menu');
    }

    generateTextures() {
      var g;

      // Mole hole (dark rounded rect as oval substitute)
      g = this.add.graphics();
      g.fillStyle(0x2a1a0a, 1);
      g.fillRoundedRect(0, 2, 80, 26, 13);
      g.generateTexture('hole', 80, 30);
      g.destroy();

      // Mole body (brown square with face)
      g = this.add.graphics();
      g.fillStyle(0x8B4513, 1);
      g.fillRoundedRect(5, 5, 50, 50, 10);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(20, 20, 6);
      g.fillCircle(40, 20, 6);
      g.fillStyle(0x000000, 1);
      g.fillCircle(21, 20, 3);
      g.fillCircle(41, 20, 3);
      g.fillStyle(0xff69b4, 1);
      g.fillCircle(30, 30, 4);
      g.lineStyle(2, 0x000000, 1);
      g.beginPath();
      g.arc(30, 33, 8, 0, Math.PI, false);
      g.strokePath();
      g.generateTexture('mole', 60, 60);
      g.destroy();

      // Star particle (manual path)
      g = this.add.graphics();
      g.fillStyle(0xffff00, 1);
      g.beginPath();
      var cx = 8, cy = 8, spikes = 5, outerR = 8, innerR = 3;
      var a = -Math.PI / 2, s = Math.PI / spikes;
      for (var i = 0; i < spikes * 2; i++) {
        var r = i % 2 === 0 ? outerR : innerR;
        if (i === 0) { g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        else { g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        a += s;
      }
      g.closePath();
      g.fillPath();
      g.generateTexture('star', 16, 16);
      g.destroy();

      // Button background
      g = this.add.graphics();
      g.fillStyle(0x333333, 1);
      g.fillRoundedRect(0, 0, 200, 50, 8);
      g.lineStyle(2, 0x33ff33, 1);
      g.strokeRoundedRect(0, 0, 200, 50, 8);
      g.generateTexture('button', 200, 50);
      g.destroy();

      // Wide button
      g = this.add.graphics();
      g.fillStyle(0x333333, 1);
      g.fillRoundedRect(0, 0, 300, 60, 8);
      g.lineStyle(2, 0x33ff33, 1);
      g.strokeRoundedRect(0, 0, 300, 60, 8);
      g.generateTexture('button-wide', 300, 60);
      g.destroy();

      // Hammer
      g = this.add.graphics();
      g.fillStyle(0x8B6914, 1);
      g.fillRect(22, 30, 6, 30);
      g.fillStyle(0x888888, 1);
      g.fillRoundedRect(5, 10, 40, 25, 4);
      g.generateTexture('hammer', 50, 60);
      g.destroy();

      // Dirt mound (front layer to hide mole bottom)
      g = this.add.graphics();
      g.fillStyle(0x4a7a2e, 1);
      g.fillRoundedRect(0, 0, 90, 20, 10);
      g.fillStyle(0x6b4226, 1);
      g.fillRoundedRect(5, 5, 80, 18, 9);
      g.generateTexture('dirt-front', 90, 25);
      g.destroy();

      // Lock icon
      g = this.add.graphics();
      g.fillStyle(0x666666, 1);
      g.fillRoundedRect(4, 10, 16, 12, 2);
      g.lineStyle(3, 0x666666, 1);
      g.beginPath();
      g.arc(12, 10, 6, Math.PI, 0, false);
      g.strokePath();
      g.generateTexture('lock', 24, 24);
      g.destroy();
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.BootScene = BootScene;
})();
