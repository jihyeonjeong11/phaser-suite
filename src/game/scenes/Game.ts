import { Scene } from "phaser";
import { MINING_TYPES } from "../utils/constants";
import Phaser from "phaser";
import { Minables } from "../gameobjects/minables";
import { Hook } from "../gameobjects/Hooks";

export class Game extends Scene {
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  minables: Minables[] = [];
  hook: Hook;
  #caughtMinable: Minables | null = null;

  constructor() {
    super("Game");
  }
  /**
   * This renders the whole game screen.
   */
  create() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "background")
      .setDisplaySize(width, height);
    this.#renderHUD();
    this.#renderMiningHook();
    this.#spawnMinables();
    this.hook.on("reelComplete", this.#onReelComplete, this);
  }

  update(_time: number, delta: number): void {
    this.hook.update(delta);
    this.#checkCollision();
    this.#trackCaughtMinable();
  }

  #onReelComplete(): void {
    if (!this.#caughtMinable) return;
    const value = this.#caughtMinable.collect();
    console.log(`Collected! value: ${value}`);
    this.minables = this.minables.filter((m) => m !== this.#caughtMinable);
    this.#caughtMinable = null;
  }

  #checkCollision(): void {
    if (this.hook.hookState !== "FIRING") return;
    const tx = this.hook.tipWorldX;
    const ty = this.hook.tipWorldY;
    for (const m of this.minables) {
      if (m.isCaught) continue;
      const dx = tx - m.x;
      const dy = ty - m.y;
      if (Math.sqrt(dx * dx + dy * dy) < m.radius) {
        m.catch();
        this.#caughtMinable = m;
        this.hook.catchObject(m.weight);
        break;
      }
    }
  }

  #trackCaughtMinable(): void {
    if (!this.#caughtMinable) return;
    this.#caughtMinable.setPosition(this.hook.tipWorldX, this.hook.tipWorldY);
  }

  #spawnMinables(): void {
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

  #renderMiningHook(): void {
    this.hook = new Hook(this, this.scale.width / 2, 80);
  }

  #renderMiner() {
    this.add.image(this.scale.width / 2, 40, "miner").setDisplaySize(64, 64);
  }

  #renderHUD() {
    const hud = this.add
      .rectangle(0, 0, this.scale.width, 100, 0xffff00)
      .setOrigin(0, 0);
    this.add.existing(hud);
    this.#renderMiner();
  }
}
