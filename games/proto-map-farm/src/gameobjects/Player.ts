import { Scene } from "phaser";
import { Character, IMovement } from "./Character";

export class Player extends Character {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  constructor(scene: Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    this.cursors = scene.input.keyboard!.createCursorKeys();
  }
  protected getMovement(): IMovement {
    const c = this.cursors;
    return {
      vx: (c.right.isDown ? 1 : 0) - (c.left.isDown ? 1 : 0),
      vy: (c.down.isDown ? 1 : 0) - (c.up.isDown ? 1 : 0),
    };
  }
}
