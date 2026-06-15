import { GameObjects, Scene, Scenes } from "phaser";
import { HUD_H } from "../utils/constants";
import { REG } from "../utils/registry";

export class Hud extends GameObjects.Container {
  #moneyText: GameObjects.Text;
  #timeText: GameObjects.Text;

  constructor(
    scene: Scene,
    money: number,
    goalAmount: number,
    timeRemaining: number,
    currentLevel: number,
  ) {
    super(scene, 0, 0);

    const W = scene.scale.width;
    const cx = W / 2;
    const rx = W - 100;

    const g = scene.add.graphics();
    g.fillStyle(0xf0a000);
    g.fillRect(0, 0, W, HUD_H);

    this.#moneyText = scene.add.text(12, 30, `$${money}`, {
      fontSize: "22px",
      color: "#44ff44",
      fontStyle: "bold",
    });
    this.#timeText = scene.add.text(rx, 30, `${timeRemaining}`, {
      fontSize: "22px",
      color: "#ff4400",
      fontStyle: "bold",
    });

    this.add([
      g,
      scene.add.text(12, 8, "Money", { fontSize: "17px", color: "#ffffff" }),
      this.#moneyText,
      scene.add.text(12, 60, "Goal", { fontSize: "17px", color: "#ffffff" }),
      scene.add.text(12, 82, `$${goalAmount}`, {
        fontSize: "22px",
        color: "#ffd700",
        fontStyle: "bold",
      }),
      scene.add.image(cx, 47, "miner").setScale(0.64),
      scene.add.text(rx, 8, "Time:", { fontSize: "17px", color: "#222222" }),
      this.#timeText,
      scene.add.text(rx, 60, "Level:", { fontSize: "17px", color: "#222222" }),
      scene.add.text(rx, 82, `${currentLevel}`, {
        fontSize: "22px",
        color: "#ff4400",
        fontStyle: "bold",
      }),
    ]);

    const onMoneyChange = (_: unknown, value: number) => this.setMoney(value);
    const onTimeChange = (_: unknown, value: number) => this.setTime(value);

    scene.registry.events.on(`changedata-${REG.MONEY}`, onMoneyChange);
    scene.registry.events.on(`changedata-${REG.TIME}`, onTimeChange);

    scene.events.once(Scenes.Events.SHUTDOWN, () => {
      scene.registry.events.off(`changedata-${REG.MONEY}`, onMoneyChange);
      scene.registry.events.off(`changedata-${REG.TIME}`, onTimeChange);
    });

    this.setDepth(10);
    scene.add.existing(this);
  }

  setMoney(value: number): void {
    this.#moneyText.setText(`$${value}`);
  }

  setTime(seconds: number): void {
    this.#timeText.setText(`${seconds}`);
  }
}
