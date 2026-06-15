import { GameObjects, Scene } from "phaser";

export class MainMenu extends Scene {
  #logo!: GameObjects.Image;

  constructor() {
    super("MainMenu");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .image(width / 2, height / 2, "background")
      .setDisplaySize(width, height);

    this.#logo = this.add.image(width / 2, height * 0.42, "logo");
    const maxLogoWidth = width * 0.82;
    if (this.#logo.width > maxLogoWidth) {
      this.#logo.setScale(maxLogoWidth / this.#logo.width);
    }

    this.add
      .text(width / 2, height * 0.78, "Click anywhere to Start", {
        fontFamily: "Arial Black",
        fontSize: 28,
        color: "#ffd700",
        stroke: "#000000",
        strokeThickness: 6,
        align: "center",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("GoalAnnounce", { level: 1 });
    });
  }
}
