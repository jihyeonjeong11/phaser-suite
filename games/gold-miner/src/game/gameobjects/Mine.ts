import { Scene } from "phaser";
import { HUD_H } from "../utils/constants";
import { LEVEL_TEMPLATES } from "../utils/levels";
import { Minable } from "./Minable";

const PADDING = 50;

export class Mine {
  readonly minables: Minable[];

  constructor(scene: Scene, level: number) {
    const pool = LEVEL_TEMPLATES[level];
    const template = pool[Math.floor(Math.random() * pool.length)];
    const { width, height } = scene.scale;
    const top = HUD_H + PADDING;
    const bottom = height - PADDING;
    const left = PADDING;
    const right = width - PADDING;

    this.minables = template.minables.map(({ type, nx, ny }) => {
      const x = left + nx * (right - left);
      const y = top + ny * (bottom - top);
      return new Minable(scene, x, y, type);
    });
  }

  destroy(): void {
    this.minables.forEach((m) => m.destroy());
  }
}
