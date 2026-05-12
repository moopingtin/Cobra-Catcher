export default class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  create() {
    this._makePenguin();
    this._makeLauncher();
    this._makeTree();
    this._makeMonkey();
    this._makeGorilla();
    this._makeCoconut();
    this._makeCobra();
    this._makeCobraKing();
    this._makeBush();
    this._makeNet();
    this._makeLeopard();
    this._makeButterfly();
    this._makeHearts();
    this._makeParticles();
    this._makeBackground();
    this.scene.start('Menu');
  }

  // Draw fn draws on a Graphics object; generateTexture bakes it to a texture key
  _tex(key, w, h, fn) {
    const g = this.add.graphics();
    fn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  _makePenguin() {
    this._tex('penguin', 48, 64, (g) => {
      g.fillStyle(0x111111); g.fillRect(8, 12, 32, 40);   // body
      g.fillStyle(0xeeeeee); g.fillRect(14, 20, 20, 28);   // belly
      g.fillStyle(0x111111); g.fillRect(12, 2, 24, 18);    // head
      g.fillStyle(0xffffff); g.fillRect(15, 6, 7, 7);      // eye whites
      g.fillStyle(0xffffff); g.fillRect(26, 6, 7, 7);
      g.fillStyle(0x111111); g.fillRect(18, 8, 4, 4);      // pupils
      g.fillStyle(0x111111); g.fillRect(29, 8, 4, 4);
      g.fillStyle(0xff8800); g.fillRect(20, 14, 8, 5);     // beak
      g.fillStyle(0xff8800); g.fillRect(10, 50, 12, 6);    // feet
      g.fillStyle(0xff8800); g.fillRect(26, 50, 12, 6);
      g.fillStyle(0xff8800); g.fillRect(6, 54, 16, 4);
      g.fillStyle(0xff8800); g.fillRect(26, 54, 16, 4);
      g.fillStyle(0x333333); g.fillRect(2, 22, 8, 24);     // wings
      g.fillStyle(0x333333); g.fillRect(38, 22, 8, 24);
    });
  }

  _makeLauncher() {
    this._tex('launcher', 64, 14, (g) => {
      g.fillStyle(0x666666); g.fillRect(0, 3, 58, 8);
      g.fillStyle(0x888888); g.fillRect(0, 3, 58, 3);
      g.fillStyle(0x444444); g.fillRect(50, 0, 14, 14);
      g.fillStyle(0x222222); g.fillRect(57, 3, 7, 8);      // barrel
    });
  }

  _makeCobra() {
    this._tex('cobra', 48, 48, (g) => {
      g.fillStyle(0x0066ff);
      g.fillRect(4, 20, 40, 8); g.fillRect(4, 28, 8, 12);
      g.fillRect(4, 36, 40, 8); g.fillRect(36, 28, 8, 12);
      g.fillStyle(0x0044cc);
      g.fillRect(12, 24, 24, 4); g.fillRect(12, 28, 4, 8);
      g.fillRect(12, 32, 24, 4); g.fillRect(32, 28, 4, 8);
      g.fillStyle(0x0055ee); g.fillRect(14, 4, 20, 18);    // hood
      g.fillStyle(0x0033aa); g.fillRect(12, 8, 24, 14);
      g.fillStyle(0x0055ee); g.fillRect(8, 10, 32, 8);     // hood flare
      g.fillStyle(0xffee00); g.fillRect(17, 6, 5, 5);      // eyes
      g.fillStyle(0xffee00); g.fillRect(26, 6, 5, 5);
      g.fillStyle(0x000000); g.fillRect(19, 8, 2, 3);
      g.fillStyle(0x000000); g.fillRect(28, 8, 2, 3);
      g.fillStyle(0xff2200); g.fillRect(20, 20, 2, 6);     // tongue
      g.fillStyle(0xff2200); g.fillRect(18, 24, 2, 2);
      g.fillStyle(0xff2200); g.fillRect(22, 24, 2, 2);
    });

    this._tex('cobra-escape', 48, 48, (g) => {
      g.fillStyle(0x0066ff);
      g.fillRect(4, 28, 44, 8); g.fillRect(4, 36, 44, 8);
      g.fillStyle(0x0055ee); g.fillRect(16, 16, 16, 14);
      g.fillStyle(0x0033aa); g.fillRect(14, 20, 20, 10);
      g.fillStyle(0x0055ee); g.fillRect(10, 22, 28, 6);
      g.fillStyle(0xffee00); g.fillRect(17, 18, 4, 4);
      g.fillStyle(0xffee00); g.fillRect(27, 18, 4, 4);
      g.fillStyle(0xff2200); g.fillRect(21, 28, 2, 4);
      g.fillStyle(0xff2200); g.fillRect(19, 30, 2, 2);
      g.fillStyle(0xff2200); g.fillRect(23, 30, 2, 2);
    });
  }

  _makeCobraKing() {
    this._tex('cobra-king', 96, 96, (g) => {
      g.fillStyle(0x0066ff);
      g.fillRect(8, 40, 80, 16); g.fillRect(8, 56, 16, 24);
      g.fillRect(8, 72, 80, 16); g.fillRect(72, 56, 16, 24);
      g.fillStyle(0x0044cc);
      g.fillRect(24, 48, 48, 8); g.fillRect(24, 56, 8, 16);
      g.fillRect(24, 64, 48, 8); g.fillRect(64, 56, 8, 16);
      g.fillStyle(0x0055ee); g.fillRect(28, 8, 40, 36);    // head
      g.fillStyle(0x0033aa); g.fillRect(24, 16, 48, 28);
      g.fillStyle(0x0055ee); g.fillRect(16, 20, 64, 16);   // hood flare
      g.fillStyle(0xffee00); g.fillRect(30, 12, 10, 10);   // eyes
      g.fillStyle(0xffee00); g.fillRect(56, 12, 10, 10);
      g.fillStyle(0x000000); g.fillRect(34, 15, 4, 6);
      g.fillStyle(0x000000); g.fillRect(60, 15, 4, 6);
      g.fillStyle(0xffcc00); g.fillRect(24, 0, 48, 10);    // crown
      g.fillStyle(0xffcc00); g.fillRect(20, 4, 8, 6);
      g.fillStyle(0xffcc00); g.fillRect(44, 0, 8, 8);
      g.fillStyle(0xffcc00); g.fillRect(68, 4, 8, 6);
      g.fillStyle(0xff4400); g.fillRect(26, 2, 4, 4);      // gems
      g.fillStyle(0xff4400); g.fillRect(46, 0, 4, 4);
      g.fillStyle(0xff4400); g.fillRect(66, 2, 4, 4);
      g.fillStyle(0xff2200); g.fillRect(44, 42, 4, 12);    // tongue
      g.fillStyle(0xff2200); g.fillRect(40, 52, 4, 4);
      g.fillStyle(0xff2200); g.fillRect(48, 52, 4, 4);
    });
  }

  _makeBush() {
    this._tex('bush', 80, 64, (g) => {
      g.fillStyle(0x1a2e1a); g.fillEllipse(40, 58, 70, 12); // shadow
      g.fillStyle(0x2d6b2d); g.fillRect(4, 28, 72, 30);
      g.fillStyle(0x3d8b3d);
      g.fillRect(8, 20, 20, 20); g.fillRect(24, 16, 24, 24);
      g.fillRect(44, 22, 22, 20); g.fillRect(12, 12, 18, 18);
      g.fillRect(50, 14, 18, 20); g.fillRect(30, 8, 22, 18);
      g.fillStyle(0x4dab4d);
      g.fillRect(16, 16, 10, 14); g.fillRect(34, 10, 12, 16);
      g.fillRect(54, 18, 10, 14);
      g.fillStyle(0x1d5b1d);
      g.fillRect(20, 30, 8, 12); g.fillRect(40, 28, 8, 12);
      g.fillRect(60, 30, 8, 10);
    });

    this._tex('bush-rustle', 80, 64, (g) => {
      g.fillStyle(0x1a2e1a); g.fillEllipse(40, 58, 70, 12);
      g.fillStyle(0x2d6b2d); g.fillRect(4, 28, 72, 30);
      g.fillStyle(0x3d8b3d);
      g.fillRect(6, 18, 20, 22); g.fillRect(26, 14, 24, 24);
      g.fillRect(46, 20, 22, 22); g.fillRect(10, 10, 18, 20);
      g.fillRect(52, 12, 18, 22); g.fillRect(28, 6, 22, 20);
      g.fillStyle(0x5dbb5d);
      g.fillRect(14, 12, 10, 16); g.fillRect(32, 8, 12, 18);
      g.fillRect(56, 16, 10, 16);
      g.fillStyle(0x1d5b1d);
      g.fillRect(22, 28, 8, 14); g.fillRect(42, 26, 8, 14);
      g.fillRect(62, 28, 8, 12);
    });
  }

  _makeNet() {
    this._tex('net', 48, 48, (g) => {
      g.lineStyle(2, 0x00ffcc, 1);
      for (let y = 8; y <= 40; y += 8) {
        const hw = Math.sqrt(Math.max(0, 576 - (y - 24) * (y - 24)));
        g.beginPath(); g.moveTo(24 - hw, y); g.lineTo(24 + hw, y); g.strokePath();
      }
      for (let x = 8; x <= 40; x += 8) {
        const hh = Math.sqrt(Math.max(0, 576 - (x - 24) * (x - 24)));
        g.beginPath(); g.moveTo(x, 24 - hh); g.lineTo(x, 24 + hh); g.strokePath();
      }
      g.lineStyle(3, 0x00ffcc, 1); g.strokeCircle(24, 24, 22);
    });
  }

  _makeLeopard() {
    this._tex('leopard', 96, 64, (g) => {
      g.fillStyle(0xe8c050); g.fillRect(16, 20, 64, 28);    // body
      g.fillStyle(0xe8c050); g.fillEllipse(16, 34, 24, 24); // back
      g.fillStyle(0xe8c050); g.fillRect(68, 14, 28, 26);    // head
      g.fillStyle(0xf0d080); g.fillRect(88, 22, 14, 14);    // snout
      g.fillStyle(0x22cc22); g.fillRect(72, 16, 8, 8);      // eyes
      g.fillStyle(0x22cc22); g.fillRect(85, 16, 8, 8);
      g.fillStyle(0x000000); g.fillRect(75, 18, 3, 5);
      g.fillStyle(0x000000); g.fillRect(88, 18, 3, 5);
      g.fillStyle(0xe8c050); g.fillRect(70, 8, 10, 10);     // ears
      g.fillStyle(0xe8c050); g.fillRect(88, 8, 10, 10);
      g.fillStyle(0xff9999); g.fillRect(72, 9, 6, 7);
      g.fillStyle(0xff9999); g.fillRect(90, 9, 6, 7);
      g.fillStyle(0xff7799); g.fillRect(93, 26, 6, 4);      // nose
      g.fillStyle(0x000000); g.fillRect(91, 30, 4, 2);
      g.fillStyle(0x000000); g.fillRect(97, 30, 4, 2);
      g.fillStyle(0xe8c050);                                 // legs
      g.fillRect(20, 44, 12, 16); g.fillRect(38, 44, 12, 16);
      g.fillRect(56, 44, 12, 16); g.fillRect(68, 44, 12, 16);
      g.fillStyle(0xf0d080);                                 // paws
      g.fillRect(18, 58, 16, 6); g.fillRect(36, 58, 16, 6);
      g.fillRect(54, 58, 16, 6); g.fillRect(66, 58, 16, 6);
      g.fillStyle(0x8b6010);                                 // spots
      [[26,22,8,6],[42,24,8,6],[58,22,8,6],[32,34,8,6],[50,36,8,6],[66,34,6,6]].forEach(([x,y,w,h]) => g.fillRect(x,y,w,h));
      g.fillStyle(0xe8c050); g.fillRect(0, 26, 18, 8);      // tail
      g.fillStyle(0x8b6010); g.fillRect(2,26,4,4); g.fillRect(8,28,4,4); g.fillRect(14,26,4,4);
    });
  }

  _makeButterfly() {
    this._tex('butterfly', 32, 28, (g) => {
      g.fillStyle(0xff6600); g.fillRect(4, 4, 12, 12); g.fillRect(16, 4, 12, 12); // upper wings
      g.fillStyle(0x000000); g.fillRect(4, 4, 2, 12); g.fillRect(14, 4, 4, 12);
      g.fillStyle(0x000000); g.fillRect(16, 4, 2, 12); g.fillRect(26, 4, 2, 12);
      g.fillStyle(0xffffff); g.fillRect(6, 6, 3, 3); g.fillRect(6, 11, 3, 3);
      g.fillStyle(0xffffff); g.fillRect(23, 6, 3, 3); g.fillRect(23, 11, 3, 3);
      g.fillStyle(0xff8800); g.fillRect(6, 14, 10, 10); g.fillRect(16, 14, 10, 10); // lower wings
      g.fillStyle(0x000000); g.fillRect(6, 14, 2, 10); g.fillRect(14, 14, 4, 10);
      g.fillStyle(0x000000); g.fillRect(16, 14, 2, 10); g.fillRect(24, 14, 2, 10);
      g.fillStyle(0x111111); g.fillRect(14, 2, 4, 24);                              // body
      g.fillStyle(0x111111); g.fillRect(13, 0, 2, 4); g.fillRect(17, 0, 2, 4);     // antennae
      g.fillStyle(0xffcc00); g.fillRect(12, 0, 2, 2); g.fillRect(18, 0, 2, 2);
    });

    this._tex('butterfly-flap', 32, 28, (g) => {
      g.fillStyle(0xff6600); g.fillRect(6, 2, 10, 14); g.fillRect(16, 2, 10, 14);
      g.fillStyle(0x000000); g.fillRect(6, 2, 2, 14); g.fillRect(14, 2, 4, 14);
      g.fillStyle(0x000000); g.fillRect(16, 2, 2, 14); g.fillRect(24, 2, 2, 14);
      g.fillStyle(0xff8800); g.fillRect(7, 14, 8, 8); g.fillRect(17, 14, 8, 8);
      g.fillStyle(0x000000); g.fillRect(7, 14, 2, 8); g.fillRect(13, 14, 4, 8);
      g.fillStyle(0x000000); g.fillRect(17, 14, 2, 8); g.fillRect(23, 14, 2, 8);
      g.fillStyle(0x111111); g.fillRect(14, 0, 4, 24);
      g.fillStyle(0x111111); g.fillRect(13, 0, 2, 4); g.fillRect(17, 0, 2, 4);
    });
  }

  _makeHearts() {
    this._tex('heart-full', 24, 22, (g) => {
      g.fillStyle(0xff2244);
      g.fillRect(4, 4, 6, 4); g.fillRect(14, 4, 6, 4);
      g.fillRect(2, 6, 20, 8); g.fillRect(4, 14, 16, 4);
      g.fillRect(6, 16, 12, 2); g.fillRect(8, 18, 8, 2); g.fillRect(10, 20, 4, 2);
      g.fillStyle(0xff6688); g.fillRect(6, 6, 4, 4);      // highlight
    });

    this._tex('heart-empty', 24, 22, (g) => {
      g.fillStyle(0x444444);
      g.fillRect(4, 4, 6, 4); g.fillRect(14, 4, 6, 4);
      g.fillRect(2, 6, 20, 8); g.fillRect(4, 14, 16, 4);
      g.fillRect(6, 16, 12, 2); g.fillRect(8, 18, 8, 2); g.fillRect(10, 20, 4, 2);
    });
  }

  _makeParticles() {
    this._tex('star', 8, 8, (g) => {
      g.fillStyle(0xffff00); g.fillRect(3, 0, 2, 8); g.fillRect(0, 3, 8, 2);
      g.fillStyle(0xffffff); g.fillRect(3, 3, 2, 2);
    });
  }

  _makeTree() {
    this._tex('tree', 72, 104, (g) => {
      // Shadow
      g.fillStyle(0x0d1a0d); g.fillEllipse(36, 100, 50, 10);
      // Trunk
      g.fillStyle(0x4a2a0a); g.fillRect(30, 62, 12, 38);
      g.fillStyle(0x6a3a14); g.fillRect(32, 62, 5, 38);
      // Root bumps
      g.fillStyle(0x3a1e08); g.fillRect(22, 86, 12, 14); g.fillRect(38, 86, 12, 14);
      // Leaves — 3 layered blobs
      g.fillStyle(0x1a5218); g.fillEllipse(36, 52, 68, 48);
      g.fillStyle(0x236b24); g.fillEllipse(36, 38, 56, 40);
      g.fillStyle(0x2e8630); g.fillEllipse(36, 26, 42, 32);
      // Highlights
      g.fillStyle(0x44b045); g.fillEllipse(28, 18, 16, 14); g.fillEllipse(42, 24, 12, 10);
      g.fillStyle(0x66cc68); g.fillEllipse(26, 16, 6, 6);
    });
  }

  _makeMonkey() {
    this._tex('monkey', 36, 44, (g) => {
      // Body
      g.fillStyle(0x7b4c2a); g.fillRect(10, 18, 16, 18);
      // Head
      g.fillStyle(0x7b4c2a); g.fillEllipse(18, 13, 20, 18);
      // Face
      g.fillStyle(0xc8935a); g.fillEllipse(18, 15, 13, 11);
      // Eyes
      g.fillStyle(0x111111); g.fillRect(13, 10, 3, 3); g.fillRect(20, 10, 3, 3);
      g.fillStyle(0xffffff); g.fillRect(13, 10, 1, 1); g.fillRect(20, 10, 1, 1);
      // Nose
      g.fillStyle(0x8b5a2a); g.fillRect(16, 15, 4, 3);
      // Mouth
      g.fillStyle(0x5a3010); g.fillRect(15, 19, 6, 2);
      // Ears
      g.fillStyle(0x7b4c2a); g.fillEllipse(8, 12, 8, 9); g.fillEllipse(28, 12, 8, 9);
      g.fillStyle(0xc8935a); g.fillEllipse(8, 12, 4, 5); g.fillEllipse(28, 12, 4, 5);
      // Arms
      g.fillStyle(0x7b4c2a); g.fillRect(2, 18, 10, 6); g.fillRect(24, 18, 10, 6);
      g.fillStyle(0xc8935a); g.fillRect(0, 22, 7, 5); g.fillRect(29, 22, 7, 5);
      // Legs
      g.fillStyle(0x7b4c2a); g.fillRect(11, 34, 6, 10); g.fillRect(19, 34, 6, 10);
      g.fillStyle(0xc8935a); g.fillRect(9, 42, 8, 4); g.fillRect(19, 42, 8, 4);
      // Tail
      g.fillStyle(0x7b4c2a); g.fillRect(24, 28, 4, 14); g.fillRect(28, 36, 4, 6); g.fillRect(30, 40, 4, 4);
    });
  }

  _makeGorilla() {
    this._tex('gorilla', 88, 100, (g) => {
      // Body
      g.fillStyle(0x1e1e1e); g.fillRect(14, 36, 60, 50);
      // Chest (lighter)
      g.fillStyle(0x3a3a3a); g.fillRect(26, 42, 36, 34);
      // Head
      g.fillStyle(0x1e1e1e); g.fillEllipse(44, 24, 50, 42);
      // Brow ridge
      g.fillStyle(0x111111); g.fillRect(18, 8, 52, 12);
      // Face
      g.fillStyle(0x4a4a4a); g.fillEllipse(44, 30, 30, 24);
      // Eyes (red and angry)
      g.fillStyle(0xdd1100); g.fillRect(28, 16, 10, 8); g.fillRect(50, 16, 10, 8);
      g.fillStyle(0x000000); g.fillRect(31, 18, 5, 5); g.fillRect(53, 18, 5, 5);
      g.fillStyle(0xffffff); g.fillRect(31, 18, 2, 2); g.fillRect(53, 18, 2, 2);
      // Nose
      g.fillStyle(0x2a2a2a); g.fillRect(38, 28, 12, 8); g.fillRect(36, 30, 5, 6); g.fillRect(47, 30, 5, 6);
      g.fillStyle(0x111111); g.fillRect(38, 32, 4, 4); g.fillRect(46, 32, 4, 4);
      // Mouth / teeth
      g.fillStyle(0x111111); g.fillRect(32, 40, 24, 5);
      g.fillStyle(0xeeeeee); g.fillRect(34, 40, 5, 6); g.fillRect(40, 40, 5, 6); g.fillRect(49, 40, 5, 6);
      // Long arms
      g.fillStyle(0x1e1e1e); g.fillRect(0, 36, 16, 48); g.fillRect(72, 36, 16, 48);
      // Knuckles
      g.fillStyle(0x3a3a3a); g.fillRect(0, 78, 16, 8); g.fillRect(72, 78, 16, 8);
      // Legs
      g.fillStyle(0x1e1e1e); g.fillRect(16, 78, 22, 22); g.fillRect(50, 78, 22, 22);
      // Feet
      g.fillStyle(0x2a2a2a); g.fillRect(12, 92, 28, 8); g.fillRect(48, 92, 28, 8);
    });
  }

  _makeCoconut() {
    this._tex('coconut', 20, 20, (g) => {
      g.fillStyle(0x4a2e10); g.fillCircle(10, 10, 9);
      g.fillStyle(0x6a4420); g.fillCircle(8, 7, 4);
      g.fillStyle(0x2e1a06); g.fillRect(4, 9, 12, 2); g.fillRect(6, 5, 8, 2); g.fillRect(6, 13, 8, 2);
      g.fillStyle(0x8a5a28); g.fillRect(6, 6, 3, 3);
    });
  }

  _makeBackground() {
    this._tex('background', 800, 600, (g) => {
      g.fillStyle(0x0d260d); g.fillRect(0, 0, 800, 600);
      // Dirt clearing
      g.fillStyle(0x4a3a28); g.fillEllipse(400, 300, 340, 280);
      g.fillStyle(0x5a4a38); g.fillEllipse(400, 300, 280, 220);
      // Grass patches
      const patches = [
        [60,80],[160,40],[300,30],[500,28],[640,45],[740,90],
        [30,200],[770,220],[20,380],[760,360],[50,500],[700,520],
        [200,570],[400,580],[600,565]
      ];
      g.fillStyle(0x1a4d1a);
      patches.forEach(([x,y]) => { g.fillRect(x-10, y-4, 20+Math.floor(x%10)*2, 6); g.fillRect(x-6, y-10, 12, 8); });
    });
  }
}
