import Phaser from "phaser";

export class Hook extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.render();
    this.scene.add.existing(this);
  }
  private render() {
    console.log("render");
    const image = this.scene.add
      .image(0, 0, "hook")
      .setDisplaySize(32, 32)
      .setAngle(180);
    this.add(image);
  }
}
