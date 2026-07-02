import { Scene } from "phaser";
import { Character, IMovement } from "./Character";

export class NPC extends Character {
  private moving = false;
  private timer = 0;
  private dir: IMovement = { vx: 0, vy: 0 };

  constructor(
    scene: Scene,
    x: number,
    y: number,
    textureKey: string,
    hairRow = 0,
  ) {
    super(scene, x, y, textureKey, hairRow);
    this.setImmovable();
  }

  protected getMovement(delta: number): IMovement {
    this.timer += delta;

    if (this.moving) {
      if (this.timer >= 100) {
        this.moving = false;
        this.timer = 0;
        return { vx: 0, vy: 0 };
      }
      return this.dir;
    }

    if (this.timer >= 3000) {
      this.moving = true;
      this.timer = 0;
      this.dir = this.pickRandom();
      return this.dir;
    }

    return { vx: 0, vy: 0 };
  }

  private pickRandom(): IMovement {
    const dirs: IMovement[] = [
      { vx: 1, vy: 0 },
      { vx: -1, vy: 0 },
      { vx: 0, vy: 1 },
      { vx: 0, vy: -1 },
    ];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }
}
