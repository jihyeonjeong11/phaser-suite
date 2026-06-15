import { Scene } from "phaser";
import { getLevelGoal } from "../utils/levels";

export class GoalAnnounce extends Scene {
  #level: number = 1;

  constructor() {
    super("GoalAnnounce");
  }

  init(data: { level: number }) {
    this.#level = data.level;
  }

  create() {
    const { width, height } = this.scale;
    const goal = getLevelGoal(this.#level);

    this.add.rectangle(width / 2, height / 2, width, height, 0xd4a000);

    this.add
      .text(width / 2, height * 0.28, "Gold Miner", {
        fontFamily: "Arial Black",
        fontSize: 48,
        color: "#ffd700",
        stroke: "#8b4513",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const panel = this.add.rectangle(
      width / 2,
      height * 0.58,
      width * 0.6,
      height * 0.32,
      0x7a3a00,
    );
    panel.setStrokeStyle(3, 0x4a1a00);

    this.add
      .text(width / 2, height * 0.5, "Your Next Goal is", {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.64, `$${goal}`, {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#44ff44",
      })
      .setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      this.scene.start("Game", { level: this.#level });
    });
  }
}
