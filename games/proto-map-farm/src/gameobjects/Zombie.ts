import { Scene, Physics } from "phaser";
import { IMovement } from "./Character";

export class Zombie extends Physics.Arcade.Sprite {
  private readonly speed = 150;
  private moving = false;
  private timer = 0;
  private dir: IMovement = { vx: 0, vy: 0 };

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "zombie-idle", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.6);
    this.setCollideWorldBounds(true);
    this.setImmovable();
    Zombie.registerAnimations(scene);

    const body = this.body as Physics.Arcade.Body;
    body.setSize(46, 70);
    body.setOffset(42, 55);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    const movement = this.getMovement(delta);
    const body = this.body as Physics.Arcade.Body;
    body.setVelocity(movement.vx, movement.vy);
    body.velocity.normalize().scale(this.speed);

    if (movement.vx === 0 && movement.vy === 0) {
      this.play("zombie-idle", true);
      return;
    }

    if (movement.vx < 0) this.setFlipX(true);
    else if (movement.vx > 0) this.setFlipX(false);
    this.play("zombie-walk", true);
  }

  private getMovement(delta: number): IMovement {
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

  static registerAnimations(scene: Scene): void {
    if (scene.anims.exists("zombie-walk")) return;

    scene.anims.create({
      key: "zombie-walk",
      frames: scene.anims.generateFrameNumbers("zombie-walk", {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "zombie-idle",
      frames: scene.anims.generateFrameNumbers("zombie-idle", {
        start: 0,
        end: 5,
      }),
      frameRate: 6,
      repeat: -1,
    });
  }
}
