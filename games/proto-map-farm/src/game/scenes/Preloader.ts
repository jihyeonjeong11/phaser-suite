import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {}

  preload() {
    this.load.setPath("assets");
    this.load.tilemapTiledJSON("farm-map", "farm-map.json");
    for (let i = 1; i <= 7; i++) {
      this.load.image(`tiles${i}`, `${i}.png`);
    }
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
