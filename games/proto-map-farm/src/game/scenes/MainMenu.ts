import { Scene, GameObjects } from "phaser";

export class MainMenu extends Scene {
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    this.sound.play("bgm", { loop: true, volume: 0.4 });
    const canvasWidth = this.game.canvas.width;
    const canvasHeight = this.game.canvas.height;
    this.title = this.add
      .text(canvasWidth / 2, 120, "Apocalyptic farming game proto", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.input.once("pointerdown", () => {
      this.scene.start("Game");
    });
  }
}
