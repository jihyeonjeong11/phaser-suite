import { Scene } from "phaser";

export class GameComplete extends Scene {
  constructor() {
    super("GameComplete");
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0a00);

    this.add
      .text(width / 2, height * 0.32, "Congratulations!", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffd700",
        stroke: "#000000",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.52, "You cleared all levels!", {
        fontFamily: "Arial Black",
        fontSize: 26,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.78, "Click to return to menu", {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
