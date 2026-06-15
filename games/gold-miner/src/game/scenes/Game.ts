import { Scene, Sound } from "phaser";
import { Minable } from "../gameobjects/Minable";
import { Hook } from "../gameobjects/Hook";
import { Hud } from "../gameobjects/Hud";
import { HOOK_ANCHOR_Y, HUD_H, MINE_PADDING } from "../utils/constants";
import { getLevelGoal, LEVEL_TEMPLATES } from "../utils/levels";
import { REG, REGISTRY_DEFAULTS } from "../utils/registry";

export class Game extends Scene {
  #hook!: Hook;
  #minables: Minable[] = [];
  #audios: Record<string, Sound.BaseSound> = {};

  #caughtMinable: Minable | null = null;

  constructor() {
    super("Game");
  }

  init(data?: { level?: number }) {
    const level = data?.level ?? 1;
    this.registry.set(REG.MONEY, 0);
    this.registry.set(REG.TIME, REGISTRY_DEFAULTS[REG.TIME]);
    this.registry.set(REG.LEVEL, level);
    this.registry.set(REG.GOAL, getLevelGoal(level));
    this.#caughtMinable = null;
  }

  create() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "background")
      .setDisplaySize(width, height);
    new Hud(this);
    this.#loadAudios();
    this.#hook = new Hook(this, this.scale.width / 2, HOOK_ANCHOR_Y);
    this.#minables = this.#spawnMinables(
      this.registry.get(REG.LEVEL) as number,
    );
    this.#hook.on("reelComplete", this.#onReelComplete, this);
    this.time.addEvent({
      delay: 1000,
      repeat: REGISTRY_DEFAULTS[REG.TIME] - 1,
      callback: this.#onTimerTick,
      callbackScope: this,
    });
  }

  update(_time: number, delta: number): void {
    this.#hook.update(delta);
    this.#checkCollision();
    this.#trackCaught();
  }

  #onTimerTick(): void {
    const remaining = (this.registry.get(REG.TIME) as number) - 1;
    this.registry.set(REG.TIME, remaining);
    if (remaining > 0) return;

    const money = this.registry.get(REG.MONEY) as number;
    const goal = this.registry.get(REG.GOAL) as number;
    this.stopAudio("rope_creaking");
    if (money >= goal) {
      const nextLevel = (this.registry.get(REG.LEVEL) as number) + 1;
      this.scene.start(
        LEVEL_TEMPLATES[nextLevel] ? "GoalAnnounce" : "GameComplete",
        { level: nextLevel },
      );
    } else {
      this.scene.start("GameOver");
    }
  }

  #onReelComplete(): void {
    if (!this.#caughtMinable) return;
    this.playAudio("collect");
    const value = this.#caughtMinable.collect();
    const current = this.registry.get(REG.MONEY) as number;
    this.registry.set(REG.MONEY, current + value);
    this.#caughtMinable = null;
  }

  #checkCollision(): void {
    if (this.#hook.hookState !== "FIRING") return;
    const tx = this.#hook.tipWorldX;
    const ty = this.#hook.tipWorldY;
    for (const m of this.#minables) {
      if (m.isCaught) continue;
      const dx = tx - m.x;
      const dy = ty - m.y;
      if (Math.sqrt(dx * dx + dy * dy) < m.radius) {
        m.catch();
        this.#caughtMinable = m;
        this.#hook.catchObject(m.weight);
        break;
      }
    }
  }

  #spawnMinables(level: number): Minable[] {
    const pool = LEVEL_TEMPLATES[level];
    const template = pool[Math.floor(Math.random() * pool.length)];
    const { width, height } = this.scale;
    const top = HUD_H + MINE_PADDING;
    const bottom = height - MINE_PADDING;
    const left = MINE_PADDING;
    const right = width - MINE_PADDING;
    return template.minables.map(
      ({ type, nx, ny }) =>
        new Minable(
          this,
          left + nx * (right - left),
          top + ny * (bottom - top),
          type,
        ),
    );
  }

  #loadAudios(): void {
    this.#audios = {
      collect: this.sound.add("collect"),
      hook_catch: this.sound.add("hook_catch"),
      rope_creaking: this.sound.add("rope_creaking", { volume: 0.6 }),
    };
  }

  playAudio(key: string, loop = false): void {
    const snd = this.#audios[key];
    if (loop) {
      if (!snd.isPlaying) snd.play({ loop: true });
    } else {
      snd.play();
    }
  }

  stopAudio(key: string): void {
    this.#audios[key].stop();
  }

  #trackCaught(): void {
    if (!this.#caughtMinable) return;
    this.#caughtMinable.setPosition(this.#hook.tipWorldX, this.#hook.tipWorldY);
  }
}
