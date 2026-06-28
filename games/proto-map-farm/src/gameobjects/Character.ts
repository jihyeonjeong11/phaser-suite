// char base

import { Scene, Physics } from "phaser";

export interface IMovement {
  vx: number;
  vy: number;
}

export abstract class Character extends Physics.Arcade.Sprite {
  protected readonly baseScale: number = 2;
  // todo: compute actual speed for Player class
  protected readonly baseSpeed: number = 150;
  private direction: "right" | "down" | "left" | "up" = "down";
  protected abstract getMovement(delta: number): IMovement;

  constructor(scene: Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(this.baseScale);
    this.setCollideWorldBounds(true);
    Character.registerAnimations(scene, textureKey);
  }
  get getDirection() {
    return this.direction;
  }

  private getAnimKey(dir: "down" | "up" | "side") {
    return `${this.texture.key}-walk-${dir}`;
  }

  private updateDirection({ vx, vy }: IMovement) {
    if (vx < 0) this.direction = "left";
    else if (vx > 0) this.direction = "right";
    else if (vy < 0) this.direction = "up";
    else if (vy > 0) this.direction = "down";
  }

  private move({ vx, vy }: IMovement): void {
    const body = this.body as Physics.Arcade.Body;
    body.setVelocity(vx, vy);
    body.velocity.normalize().scale(this.baseSpeed);
  }

  private standStill(): void {
    this.stop();
    const isRight = this.direction === "right";
    this.setFlipX(isRight);
    this.setFrame(`${isRight ? "left" : this.direction}-1`);
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const movement = this.getMovement(delta);
    this.move(movement);
    this.updateDirection(movement);

    if (movement.vx === 0 && movement.vy === 0) {
      this.standStill();
      return;
    }

    switch (this.getDirection) {
      case "left": {
        this.setFlipX(false);
        this.play(this.getAnimKey("side"), true);
        break;
      }
      case "right": {
        this.setFlipX(true);
        this.play(this.getAnimKey("side"), true);
        break;
      }
      case "up": {
        this.play(this.getAnimKey("up"), true);
        break;
      }
      case "down": {
        this.play(this.getAnimKey("down"), true);
        break;
      }
    }
  }

  static registerAnimations(scene: Scene, textureKey: string): void {
    const key = (dir: string) => `${textureKey}-walk-${dir}`;
    if (scene.anims.exists(key("down"))) return;

    const walk = (dir: string, prefix: string) =>
      scene.anims.create({
        key: key(dir),
        frames: scene.anims.generateFrameNames(textureKey, {
          prefix,
          start: 0,
          end: 2,
        }),
        frameRate: 8,
        repeat: -1,
      });

    walk("down", "down-");
    walk("up", "up-");
    walk("side", "left-");
  }
}
