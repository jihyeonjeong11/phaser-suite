import { GameObjects, Scene } from "phaser";
import { Direction } from "./Character";

// todo: Must focus north, east, south and west to interact with tiles.
// use keyboard targeting(adjecent tile)
export class Tool extends GameObjects.Sprite {
  private static readonly OFFSET = 16;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    textureKey: string,
    frame: number,
  ) {
    super(scene, x, y, textureKey, frame);
    scene.add.existing(this);
    this.setScale(2.5);
  }

  updateOffset(owner: GameObjects.Sprite, direction: Direction): void {
    const o = Tool.OFFSET;
    switch (direction) {
      case "up":
        this.setPosition(owner.x, owner.y - o);
        this.setDepth(owner.depth + 1);
        break;
      case "down":
        this.setPosition(owner.x, owner.y + o);
        this.setDepth(owner.depth + 1);
        break;
      case "left":
        this.setPosition(owner.x + o, owner.y);
        this.setDepth(owner.depth + 1);
        this.setFlipX(true);
        break;
      case "right":
        this.setPosition(owner.x - o, owner.y);
        this.setDepth(owner.depth + 1);
        this.setFlipX(false);
        break;
    }
  }
}
