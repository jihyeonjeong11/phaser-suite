import { Scene } from "phaser";

export class Game extends Scene {
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  create() {
    this.add.image(512, 384, "background").setDisplaySize(1024, 768);

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver");
    });
  }
}
