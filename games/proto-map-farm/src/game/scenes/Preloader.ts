import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {}

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");

    //  Tiled map (exported as JSON, with tilesets embedded so Phaser can parse them).
    this.load.tilemapTiledJSON("farm-map", "farm-map.json");

    //  Tileset source images referenced by farm-map.json (1.png .. 7.png).
    for (let i = 1; i <= 7; i++) {
      this.load.image(`tiles${i}`, `${i}.png`);
    }

    //  Player atlas: down/left/up walk frames (right is left mirrored at runtime).
    //  player-sheet.png is player-ripoff.png with the maroon background keyed out.
    this.load.atlas("player", "player-sheet.png", "player-ripoff.json");
  }

  create() {
    //  Prototype: jump straight to the farm so we can iterate on the map.
    this.scene.start("Game");
  }
}
