import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {}

  preload() {
    this.load.setPath("assets");
    this.load.tilemapTiledJSON("farm-map", "farm-map.json");
    this.load.tilemapTiledJSON("home-map", "home-map.json");
    this.load.tilemapTiledJSON("ruin_map", "ruin_map.json");

    for (let i = 1; i <= 7; i++) {
      this.load.image(`${i}`, `${i}.png`);
    }
    this.load.image(`home1`, `home1.png`);
    this.load.image(`ruin_tile`, `ruin_tile.png`);
    this.load.image(`ruin_structure`, `ruin_structure.png`);
    this.load.image(`ruin_object`, `ruin_object.png`);

    this.load.spritesheet("zombie-walk", "zombie/Walk.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("zombie-idle", "zombie/Idle.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.atlas("player", "player-sheet.png", "player-ripoff.json");
    this.load.atlas(
      "carpenter",
      "carpenter-sheet.png",
      "carpenter-ripoff.json",
    );
  }

  create() {
    this.scene.start("Game");
  }
}
