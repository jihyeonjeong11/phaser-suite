import { Scene } from "phaser";
import { Hook } from "../gameobjects/hook";
import { Minables } from "../gameobjects/Minables";
import { MINING_TYPES } from "../utils/constants";
import Phaser from "phaser";

export class Game extends Scene {
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  minables: Minables[] = [];
  hook: Hook;

  constructor() {
    super("Game");
  }
  /**
   * This renders the whole game screen.
   */
  create() {
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, "background").setDisplaySize(width, height);
    this.renderHUD();
    this.renderMiningHook();
    this.spawnMinables();
  }

  update(_time: number, delta: number): void {
    this.hook.update(delta);
  }

  private spawnMinables(): void {
    const { width, height } = this.scale;
    const HUD_HEIGHT = 100;
    const types = Object.values(MINING_TYPES);
    for (let i = 0; i < 10; i++) {
      const def = types[Math.floor(Math.random() * types.length)];
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(HUD_HEIGHT + 50, height - 50);
      this.minables.push(new Minables(this, x, y, def));
    }
  }

  private renderMiningHook(): void {
    this.hook = new Hook(this, this.scale.width / 2, 80);
  }

  private renderMiner() {
    this.add.image(this.scale.width / 2, 40, "miner").setDisplaySize(64, 64);
  }

  private renderHUD() {
    const hud = this.add.rectangle(0, 0, this.scale.width, 100, 0xffff00).setOrigin(0, 0);
    this.add.existing(hud);
    this.renderMiner();
  }
}
