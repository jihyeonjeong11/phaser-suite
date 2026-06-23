import { GameObjects, Scene } from "phaser";

export class TileSprite extends GameObjects.Sprite {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    texture: string,
    frame: string,
  ) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
  }
}
