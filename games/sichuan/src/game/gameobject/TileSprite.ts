import { GameObjects, Scene } from "phaser";

// 순수 뷰 한 장. atlas 텍스처의 한 프레임을 그리고, 태어나면서 씬에 자기 자신을 등록한다.
export class TileSprite extends GameObjects.Sprite {
  constructor(scene: Scene, x: number, y: number, texture: string, frame: string) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
  }

  // preUpdate(time: number, delta: number) {
  //   super.preUpdate(time, delta);
  // }
}
