class Tile extends Phaser.GameObjects.Sprite {
  static get OK_TINT() {
    return 0x99ff99;
  }
  static get INVALID_TINT() {
    return 0xff9999;
  }
  static get SIZE() {
    return new Phaser.Geom.Rectangle(0, 8, 58, 82);
  }
  static get Z_HEIGHT() {
    return 6;
  }
  static get DOTS() {
    return [11, 12, 13, 14, 16, 17, 18, 19, 20];
  }
  static get BAMBOO() {
    return [0, 1, 2, 3, 4, 5, 6, 8, 9];
  }
  static get CHARACTERS() {
    return [7, 15, 23, 27, 28, 29, 30, 32, 33];
  }
  static get WINDS() {
    return [35, 36, 37, 38];
  }
  static get DRAGONS() {
    return [26, 34, 41];
  }
  static get FLOWERS() {
    return [10, 22, 24, 25];
  }
  static get SEASONS() {
    return [21, 31, 39, 40];
  }

  constructor(scene, board, x, y, z, index) {
    super(
      scene,
      x * Tile.SIZE.width + Tile.Z_HEIGHT * z,
      y * Tile.SIZE.height - Tile.Z_HEIGHT * z,
      "tiles",
      index || 0,
    );

    this.gridPos = new Phaser.Geom.Point(x, y);
    this.z = z;

    this.setDisplayOrigin(0, 0);

    this.setInteractive();
    this.on("pointerdown", this.clickMe, this);

    this.board = board;

    this.scene.add.existing(this);

    this.neighbours = {
      top: [],
      bottom: [],
      left: [],
      right: [],
      above: [],
    };
  }

  isBlocked() {
    return (
      this.neighbours.above.length ||
      (this.neighbours.left.length && this.neighbours.right.length)
    );
  }

  destroy() {
    const direction = this.neighbours.left.length ? 1 : -1;
    const tween = this.scene.tweens.add({
      targets: this,
      x: this.x + 200 * direction,
      rotation: -0.66 + Math.random() * 0.66,
      alpha: 0,
      ease: "Circ.easeIn",
      duration: 250,
      onUpdate: () => {
        this.board.updateShadows();
      },
      onComplete: () => {
        super.destroy();
        if (this.board) {
          this.board.updateTileNeighbours();
          this.board.updateShadows();
        }
      },
    });
  }

  isMatch(otherTile) {
    return (
      otherTile.active &&
      otherTile !== this &&
      (otherTile.frame.name === this.frame.name ||
        (Tile.FLOWERS.indexOf(otherTile.frame.name) !== -1 &&
          Tile.FLOWERS.indexOf(this.frame.name) !== -1) ||
        (Tile.SEASONS.indexOf(otherTile.frame.name) !== -1 &&
          Tile.SEASONS.indexOf(this.frame.name) !== -1))
    );
  }

  clickMe() {
    if (this.scene.debug) {
      Object.values(this.neighbours).forEach((direction) => {
        if (direction && direction.length) {
          direction.forEach((tile) => {
            tile.setTint(0xaaaaff);
            setTimeout(() => {
              tile.clearTint();
            }, 500);
          });
        }
      });
    }
    // Deselecting currently selected tile
    if (this.scene.selectedTile === this) {
      this.clearTint();
      this.scene.deselect();
    } else if (this.isBlocked()) {
      // Can't select this tile (it's blocked)
      this.setTint(Tile.INVALID_TINT);
      setTimeout(() => {
        this.clearTint();
      }, 500);
      return;
    } else if (!this.scene.selectedTile) {
      // Select this tile
      this.scene.select(this);

      if (this.scene.debug) {
        this.board
          .getTiles()
          .filter((tile) => {
            return this.isMatch(tile) && !tile.isBlocked();
          })
          .forEach((tile) => {
            tile.setTint(0xffff88);
            setTimeout(() => {
              tile.clearTint();
            }, 2000);
          });
      }
    } else if (this.isMatch(this.scene.selectedTile)) {
      // Check for a match with the selected tile
      this.scene.selectedTile.destroy();
      this.scene.deselect();
      this.destroy();
    } else {
      // No match, deselect both tiles
      this.setTint(Tile.INVALID_TINT);
      this.scene.selectedTile.setTint(Tile.INVALID_TINT);
      setTimeout(() => {
        this.clearTint();
        this.scene.selectedTile.clearTint();
        this.scene.deselect();
      }, 500);
    }
  }
}

class Board extends Phaser.GameObjects.Container {
  constructor(scene, x, y, layout) {
    super(scene, x, y);
    this.scene.add.existing(this);

    this.layout = layout;
    this.layout.board = this;

    this.layers = [];
    let shadow, container;
    for (let z = 0; z < 12; z += 1) {
      if (z % 2 === 0) {
        shadow = this.scene.make.renderTexture({
          x: -7,
          y: 7,
          width: 1024,
          height: 768,
          alpha: 0,
          origin: {
            x: 0,
            y: 0,
          },
        });
        shadow.depth = z;
        shadow.setTint(0x330000);
        this.add(shadow);
      } else {
        container = this.scene.add.container(0, 0);
        container.depth = z;
        container.shadow = shadow;
        this.add(container);
        this.layers.push(container);
      }
    }

    this.tiles = [];
  }

  getTiles() {
    let tiles = [];
    this.layers.forEach((layer) => {
      tiles = tiles.concat(layer.list.filter((tile) => tile.active));
    });
    return tiles;
  }

  shuffle() {
    const tiles = this.getTiles();
    const tileFrames = Phaser.Utils.Array.Shuffle(
      tiles.map((tile) => tile.frame.name),
    );
    tiles.forEach((tile) => {
      tile.setFrame(tileFrames.pop());
    });
    this.updateTileNeighbours();
  }

  arrange() {
    this.list
      .filter((child) => child instanceof Tile)
      .forEach((tile) => {
        this.layers[tile.z].add(tile);
        this.layers[tile.z].list.sort((a, b) => b.x - a.x + a.y - b.y);
      });

    this.getTiles().forEach((tile) => {
      tile.x += 32;
      tile.y -= 32;
      tile.alpha = 0;
      tile.disableInteractive();
    });

    this.scene.tweens.add({
      targets: this.getTiles(),
      x: "-=32",
      y: "+=32",
      alpha: 1,
      duration: 1000,
      ease: "Bounce.easeOut",
      delay: this.scene.tweens.stagger(10),
      onComplete: () => {
        this.getTiles().forEach((tile) => {
          tile.setInteractive();
        });

        this.updateShadows();

        document.querySelector("html").classList.add("lit");
        this.scene.tweens.add({
          targets: this.layers.map((layer) => layer.shadow),
          alpha: 0.4,
          duration: 500,
          onComplete: () => {
            document.querySelector("html").classList.add("after-lit");
          },
        });
      },
    });
  }

  updateShadows() {
    this.layers.forEach((layer) => {
      layer.shadow.clear();
      layer.shadow.draw(layer);
    });
  }

  // Note that there's no grid snapping; tiles can be placed anywhere and this method
  // will have a good go at trying to find adjacent tiles, though it works best if
  // the tiles are 'touching' like they would in real life.
  getTilesNear(tile, direction) {
    let dx = tile.gridPos.x,
      dy = tile.gridPos.y,
      dz = tile.z;
    switch (direction) {
      case "left":
        dx -= 1;
        break;
      case "right":
        dx += 1;
        break;
      case "top":
        dy -= 1;
        break;
      case "bottom":
        dy += 1;
        break;
      case "above":
        dz += 1;
        break;
    }

    const filtered = this.getTiles().filter((otherTile) => {
      return (
        tile != otherTile &&
        otherTile.active &&
        otherTile.z === dz &&
        // Bog standard AABB method
        otherTile.gridPos.x > dx - 1 &&
        otherTile.gridPos.x < dx + 1 &&
        otherTile.gridPos.y > dy - 1 &&
        otherTile.gridPos.y < dy + 1
      );
    });
    if (filtered && filtered.length) {
      return filtered;
    }
    return [];
  }

  #updateTileNeighboursTimeout = -1;

  #restartTimeout = -1;

  // In happier times this would be efficient and only update tiles which have been
  // affected by the previous move, but it's fast enough to just check them all...
  updateTileNeighbours() {
    clearTimeout(this.#updateTileNeighboursTimeout);

    this.#updateTileNeighboursTimeout = setTimeout(() => {
      this.getTiles().forEach((tile) => {
        tile.clearTint();
        tile.neighbours.left = this.getTilesNear(tile, "left");
        tile.neighbours.right = this.getTilesNear(tile, "right");
        tile.neighbours.top = this.getTilesNear(tile, "top");
        tile.neighbours.bottom = this.getTilesNear(tile, "bottom");
        tile.neighbours.above = this.getTilesNear(tile, "above");
      });

      let remaining = this.getTiles().filter((tile) => !tile.isBlocked());
      let remainingCount = 0;
      remaining.forEach((tile1) => {
        const matching = remaining.filter((tile2) => {
          return tile1.isMatch(tile2);
        });
        if (matching && matching.length) {
          if (this.scene.debug) {
            matching.forEach((tile) => {
              tile.setTint(0xffaaff);
            });
          }
          remainingCount += matching.length;
        }
      });
      if (this.scene.debug) {
        console.log("Valid moves left: ", remainingCount);
      }
      // GAME OVER YEAHHHHH
      if (remainingCount <= 0) {
        if (this.getTiles().length <= 0) {
          // Winnar
          clearTimeout(this.#restartTimeout);
          this.#restartTimeout = setTimeout(() => {
            window.alert("You have won, clever clogs!");
            this.scene.restart();
          }, 1000);
        }
        this.getTiles().forEach((tile) => {
          tile.setTint(0x997755);
          tile.removeInteractive();
        });
      } else {
        this.getTiles().forEach((tile) => {
          tile.clearTint();
          tile.setInteractive();
        });
      }
    });
  }
}

class BoardLayoutPosition {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get identity() {
    return `${this.x}:${this.y}:${this.z}`;
  }
}

class BoardLayout {
  static get LAYOUTS() {
    return {
      turtle: (layout) => {
        layout.createRow(1, 12, 0, 0);
        layout.createRow(3, 10, 1, 0);
        layout.createRow(2, 11, 2, 0);
        layout.createRect(1, 3, 12, 4, 0);
        layout.createRow(2, 11, 5, 0);
        layout.createRow(3, 10, 6, 0);
        layout.createRow(1, 12, 7, 0);
        layout.createTile(0, 3.5, 0);
        layout.createRow(13, 14, 3.5, 0);
        layout.createRect(4, 1, 9, 6, 1);
        layout.createRect(5, 2, 8, 5, 2);
        layout.createRect(6, 3, 7, 4, 3);
        layout.createTile(6.5, 3.5, 4);
      },
      castle: (layout) => {
        layout.createCube(1, 1, 12, 7, 0, 3);
        layout.createCube(2, 2, 11, 6, 1, 4, true);
        layout.createRowStack(0, 13, 4, 0, 4);
        layout.createColumnStack(5, 1, 7, 0, 4);
        layout.createColumnStack(8, 1, 7, 0, 4);
        layout.createCube(3, 3, 9, 5, 2, 4, true);
        layout.createRow(2.5, 3.5, 2.5, 1);
        layout.createTile(3, 2.5, 2);
        layout.createRow(9.5, 10.5, 5.5, 1);
        layout.createTile(10, 5.5, 2);
      },
      duncher: (layout) => {
        layout.createRect(2, 1, 8, 3, 0);
        layout.createRect(3, 1, 7, 3, 1);
        layout.createRect(1, 3, 9, 4, 0);
        layout.createRect(2, 3, 8, 4, 1);
        layout.createCube(0, 4, 12, 6, 0, 2);
        layout.createTile(0, 4, 2, true);
        layout.createTile(8, 1, 0, true);
        layout.createTile(12, 4, 2, true);
        layout.createRow(2, 4, 7, 0);
        layout.createRow(7, 9, 7, 0);
        layout.createRow(0, 12, 6, 2, true);
        layout.createRow(0, 12, 1, 1, true);
        layout.createTile(3, 8, 0);
        layout.createTile(8, 8, 0);
      },
    };
  }

  constructor() {
    this.positions = [];

    this.frames = [];
    // Create 4x each of the ordinary tiles
    for (let i = 0; i < 4; i++) {
      this.frames = this.frames.concat(
        Tile.DOTS,
        Tile.BAMBOO,
        Tile.CHARACTERS,
        Tile.WINDS,
        Tile.DRAGONS,
      );
    }
    // Create 1x each of the bonus (season and flower) tiles
    this.frames = this.frames.concat(Tile.FLOWERS, Tile.SEASONS);
    // Shuffle the array
    this.frames = Phaser.Utils.Array.Shuffle(this.frames);
  }

  fillPositions() {
    let frameIndex = 0;
    this.positions.forEach((pos) => {
      this.board.add(
        new Tile(
          this.board.scene,
          this.board,
          pos.x,
          pos.y,
          pos.z,
          this.frames[frameIndex++ % this.frames.length],
        ),
      );
    });
  }

  createRow(x1, x2, y, z, carve) {
    for (let x = x1; x <= x2; x++) {
      this.createTile(x, y, z, carve);
    }
  }

  createRowStack(x1, x2, y, z1, z2, carve) {
    for (let z = z1; z <= z2; z++) {
      this.createRow(x1, x2, y, z, carve);
    }
  }

  createColumn(x, y1, y2, z, carve) {
    for (let y = y1; y <= y2; y++) {
      this.createTile(x, y, z, carve);
    }
  }

  createColumnStack(x, y1, y2, z1, z2, carve) {
    for (let z = z1; z <= z2; z++) {
      this.createColumn(x, y1, y2, z, carve);
    }
  }

  createStack(x, y, z1, z2, carve) {
    for (let z = z1; z <= z2; z++) {
      this.createTile(x, y, z, carve);
    }
  }

  createRect(x1, y1, x2, y2, z, carve) {
    for (let y = y1; y <= y2; y++) {
      for (let x = x1; x <= x2; x++) {
        this.createTile(x, y, z, carve);
      }
    }
  }

  createCube(x1, y1, x2, y2, z1, z2, carve) {
    for (let z = z1; z <= z2; z++) {
      this.createRect(x1, y1, x2, y2, z, carve);
    }
  }

  createTile(x, y, z, carve) {
    const newPos = new BoardLayoutPosition(x, y, z);
    if (carve) {
      this.positions = this.positions.filter(
        (pos) => pos.identity !== newPos.identity,
      );
      return;
    }
    // Prevent overlapping positions
    if (
      this.positions.filter((pos) => pos.identity === newPos.identity).length
    ) {
      return;
    }
    this.positions.push(new BoardLayoutPosition(x, y, z));
  }

  loadPreset(key) {
    if (BoardLayout.LAYOUTS.hasOwnProperty(key)) {
      console.log("Loading layout:", key);
      BoardLayout.LAYOUTS[key](this);
      console.log("Total positions:", this.positions.length);
    }
    this.fillPositions();
  }
}

class Main extends Phaser.Scene {
  constructor() {
    super({ key: "main" });
  }
  create() {
    // this.debug = true; // turn this on if you're a nasty rotten cheat

    const board = new Board(this, 72, 72, new BoardLayout());

    // board.layout.loadPreset(Phaser.Math.RND.pick(["turtle","castle"]));
    board.layout.loadPreset("turtle");

    board.arrange();
    board.updateTileNeighbours();

    this.selectedTile = null;

    this.select = (tile) => {
      this.selectedTile = tile;
      tile.setTint(Tile.OK_TINT);
      this.tweens.add({
        targets: tile,
        x: "+=1",
        y: "-=1",
        duration: 100,
        ease: "Circle.easeInOut",
      });
    };

    this.deselect = () => {
      this.tweens.add({
        targets: this.selectedTile,
        x: "-=1",
        y: "+=1",
        duration: 100,
        ease: "Circle.easeInOut",
      });
      this.selectedTile = null;
    };

    if (this.debug) {
      this.input.keyboard.addKey("s").on("up", () => {
        if (window.confirm("Shuffle board?")) {
          board.shuffle();
          console.log("Shuffling board...");
        }
      });
    }
    this.input.keyboard.addKey("r").on("up", () => {
      if (window.confirm("Restart from the beginning?")) {
        this.restart();
        console.log("Restarting...");
      }
    });
  }
  restart() {
    this.scene.start("main");
  }
}

class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: "preloader" });
  }
  create() {
    const sheetImage = new Image();
    sheetImage.onload = () => {
      this.textures.addSpriteSheet("tiles", sheetImage, {
        frameWidth: 64,
        frameHeight: 89,
        spacing: 2,
      });
      this.scene.start("main");
    };
    sheetImage.src = "";
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  transparent: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 960,
  },
  scene: [new Preloader(), new Main()],
});
