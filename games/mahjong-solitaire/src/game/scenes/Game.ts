import { Scene } from "phaser";
import { TileSprite } from "../gameobject/TileSprite";
import { TileType } from "../utils/types";
import { SichuanGame } from "../sichuan/SichuanGame";
import { BoardObjects } from "../gameobject/BoardObjects";
import { HUD } from "../gameobject/HUD";

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  private selected: TileType | null = null;
  private boardObjects: BoardObjects;
  private sichuanGame: SichuanGame;
  private hud: HUD;
  // when zero, game over.
  private removableCount = 0;

  constructor() {
    super("Game");
  }

  init() {
    this.sichuanGame = new SichuanGame();
    this.boardObjects = new BoardObjects(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.sichuanGame.currentBoard.tiles,
      (tile, sprite) => this.onTileClick(tile, sprite),
    );
    this.hud = new HUD(
      this,
      this.cameras.main.width / 2,
      this.cameras.main.height - 40,
    );
    this.removableCount = this.sichuanGame.countAllMatches();
    this.hud.setRemovable(this.removableCount);
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x2d2d44);
  }

  private onTileClick(tile: TileType, sprite: TileSprite): void {
    if (!this.selected) {
      this.selected = tile;
      this.boardObjects.select(sprite);
      return;
    }
    if (this.selected === tile) {
      this.selected = null;
      this.boardObjects.select(null);
      return;
    }
    const path = this.sichuanGame.match(this.selected, tile);
    if (path) {
      const a = this.selected;
      const b = tile;
      this.boardObjects.showPath(path);
      this.sichuanGame.removePair(a, b);

      this.time.delayedCall(200, () => {
        this.boardObjects.removeTile(a.col, a.row);
        this.boardObjects.removeTile(b.col, b.row);
      });
      this.hud.setScore(this.sichuanGame.getRemovedPairs());
      this.removableCount = this.sichuanGame.countAllMatches();
      this.hud.setRemovable(this.removableCount);

      if (this.removableCount === 0) {
        this.time.delayedCall(400, () => this.scene.start("GameOver"));
      }
    }
    this.selected = null;
    this.boardObjects.select(null);
  }
}
