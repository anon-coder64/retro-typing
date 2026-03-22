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

      // === Space Invaders textures ===

      // Player ship (triangle pointing up)
      g = this.add.graphics();
      g.fillStyle(0x33ff33, 1);
      g.beginPath();
      g.moveTo(15, 2);
      g.lineTo(28, 28);
      g.lineTo(2, 28);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x22cc22, 1);
      g.fillRect(8, 20, 14, 6);
      g.generateTexture('ship', 30, 30);
      g.destroy();

      // Invader (pixel alien)
      g = this.add.graphics();
      g.fillStyle(0xff3333, 1);
      g.fillRect(8, 0, 14, 4);
      g.fillRect(4, 4, 22, 4);
      g.fillRect(0, 8, 30, 4);
      g.fillRect(4, 12, 6, 4);
      g.fillRect(20, 12, 6, 4);
      g.fillStyle(0x000000, 1);
      g.fillRect(8, 8, 4, 4);
      g.fillRect(18, 8, 4, 4);
      g.generateTexture('invader', 30, 16);
      g.destroy();

      // === Asteroids textures ===

      // Large asteroid
      g = this.add.graphics();
      g.fillStyle(0x888888, 1);
      g.beginPath();
      g.moveTo(15, 0);
      g.lineTo(28, 5);
      g.lineTo(30, 15);
      g.lineTo(25, 28);
      g.lineTo(12, 30);
      g.lineTo(0, 22);
      g.lineTo(2, 10);
      g.closePath();
      g.fillPath();
      g.fillStyle(0x666666, 1);
      g.fillCircle(12, 12, 3);
      g.fillCircle(20, 20, 2);
      g.generateTexture('asteroid-lg', 30, 30);
      g.destroy();

      // Small asteroid
      g = this.add.graphics();
      g.fillStyle(0x999999, 1);
      g.beginPath();
      g.moveTo(8, 0);
      g.lineTo(16, 3);
      g.lineTo(18, 10);
      g.lineTo(12, 18);
      g.lineTo(2, 14);
      g.lineTo(0, 6);
      g.closePath();
      g.fillPath();
      g.generateTexture('asteroid-sm', 18, 18);
      g.destroy();

      // === Missile Command textures ===

      // City (small building cluster)
      g = this.add.graphics();
      g.fillStyle(0x3366ff, 1);
      g.fillRect(2, 8, 8, 12);
      g.fillRect(12, 4, 6, 16);
      g.fillRect(20, 6, 8, 14);
      // Windows
      g.fillStyle(0xffff66, 1);
      g.fillRect(4, 10, 2, 2);
      g.fillRect(4, 14, 2, 2);
      g.fillRect(14, 6, 2, 2);
      g.fillRect(14, 10, 2, 2);
      g.fillRect(22, 8, 2, 2);
      g.fillRect(22, 12, 2, 2);
      g.generateTexture('city', 30, 20);
      g.destroy();

      // Defense turret
      g = this.add.graphics();
      g.fillStyle(0x33ff33, 1);
      g.fillRect(8, 0, 4, 10);
      g.fillStyle(0x228822, 1);
      g.fillRoundedRect(0, 8, 20, 12, 3);
      g.generateTexture('turret', 20, 20);
      g.destroy();

      // === Tapper textures ===

      // Tapper (bartender)
      g = this.add.graphics();
      // Body
      g.fillStyle(0xffffff, 1);
      g.fillRect(4, 8, 12, 14);
      // Head
      g.fillStyle(0xffcc99, 1);
      g.fillCircle(10, 6, 6);
      // Apron
      g.fillStyle(0xff6633, 1);
      g.fillRect(6, 12, 8, 8);
      g.generateTexture('tapper', 20, 24);
      g.destroy();

      // Customer
      g = this.add.graphics();
      // Body
      g.fillStyle(0x4488ff, 1);
      g.fillRect(4, 8, 12, 14);
      // Head
      g.fillStyle(0xffcc99, 1);
      g.fillCircle(10, 6, 6);
      // Hat
      g.fillStyle(0x333333, 1);
      g.fillRect(3, 0, 14, 4);
      g.generateTexture('customer', 20, 24);
      g.destroy();

      // Mug
      g = this.add.graphics();
      g.fillStyle(0xffcc00, 1);
      g.fillRect(2, 2, 10, 12);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 3, 8, 4);
      // Handle
      g.lineStyle(2, 0xffcc00, 1);
      g.beginPath();
      g.arc(13, 8, 4, -Math.PI / 2, Math.PI / 2, false);
      g.strokePath();
      g.generateTexture('mug', 18, 16);
      g.destroy();
    }
  }

  window.RetroTyping = window.RetroTyping || {};
  window.RetroTyping.BootScene = BootScene;
})();
