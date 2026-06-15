import { GameObjects, Scene } from "phaser";

export class GameOver extends Scene {
  #gameoverText!: GameObjects.Text;

  constructor() {
    super("GameOver");
  }

  create() {
    this.#gameoverText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      "Game Over",
      {
        fontFamily: "Arial Black",
        fontSize: 64,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      },
    );
    this.#gameoverText.setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}
