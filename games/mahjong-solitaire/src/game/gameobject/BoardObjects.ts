import { GridPos, TileType } from "../utils/types";
import { Scene, GameObjects } from "phaser";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../utils/constants";
import { TileSprite } from "./TileSprite";

const BOARD_W = 800;
const BOARD_H = 600;
const CELL_W = BOARD_W / BOARD_WIDTH;
const CELL_H = BOARD_H / BOARD_HEIGHT;

export class BoardObjects extends GameObjects.Container {
  private selectedSprite: TileSprite | null = null;
  private sprites: (TileSprite | null)[][] = Array.from(
    { length: BOARD_WIDTH },
    () => Array<TileSprite | null>(BOARD_HEIGHT).fill(null),
  );
  // Show tile movement path
  private pathGfx: GameObjects.Graphics;
  private pathTimer?: Phaser.Time.TimerEvent;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    tiles: TileType[],
    onClicked: (tile: TileType, sprite: TileSprite) => void,
  ) {
    super(scene, x, y);
    this.scene.add.existing(this);

    for (const data of tiles) {
      const { col, row, kind } = data;
      if (!kind) continue;
      const tile = new TileSprite(this.scene, 0, 0, "tiles", kind);
      tile.setDisplaySize(CELL_W, CELL_H);
      tile.setPosition(BoardObjects.toX(col), BoardObjects.toY(row));

      tile.setInteractive();
      tile.on("pointerdown", () => onClicked(data, tile));
      this.add(tile);
      this.sprites[col][row] = tile;
    }

    this.pathGfx = scene.add.graphics();
    this.add(this.pathGfx);
  }

  private static toX(col: number): number {
    return -BOARD_W / 2 + (col + 0.5) * CELL_W;
  }
  private static toY(row: number): number {
    return -BOARD_H / 2 + (row + 0.5) * CELL_H;
  }

  public showPath(path: GridPos[], holdMs = 250): void {
    this.pathTimer?.remove();
    this.pathGfx.clear();
    this.pathGfx.lineStyle(4, 0xffe066, 1);
    this.pathGfx.beginPath();
    this.pathGfx.moveTo(
      BoardObjects.toX(path[0].col),
      BoardObjects.toY(path[0].row),
    );
    for (let i = 1; i < path.length; i++) {
      this.pathGfx.lineTo(
        BoardObjects.toX(path[i].col),
        BoardObjects.toY(path[i].row),
      );
    }
    this.pathGfx.strokePath();
    this.pathTimer = this.scene.time.delayedCall(holdMs, () =>
      this.pathGfx.clear(),
    );
  }

  public select(sprite: TileSprite | null) {
    this.selectedSprite?.clearTint();
    this.selectedSprite = sprite;
    sprite?.setTint(0x888888);
  }

  public removeTile(col: number, row: number) {
    const sprite = this.sprites[col][row];
    if (!sprite) return;
    if (this.selectedSprite === sprite) this.selectedSprite = null;
    sprite.destroy();
    this.sprites[col][row] = null;
  }
}
