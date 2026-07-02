// char base

import { Scene, Physics, GameObjects } from "phaser";

export interface IMovement {
  vx: number;
  vy: number;
}

export type Direction = "right" | "down" | "left" | "up";

export abstract class Character extends Physics.Arcade.Sprite {
  protected readonly baseScale: number = 3;
  // todo: compute actual speed for Player class
  protected readonly baseSpeed: number = 150;
  private direction: Direction = "down";

  // 헤어 오버레이(hairs_char). hairRow 미지정 시 오버레이 없음(검은 기본 캡).
  private hair?: GameObjects.Sprite;
  private hairRow = 0;

  protected abstract getMovement(delta: number): IMovement;

  constructor(
    scene: Scene,
    x: number,
    y: number,
    textureKey: string,
    hairRow?: number,
  ) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(this.baseScale);
    this.setCollideWorldBounds(true);
    this.registerAnimations();

    if (hairRow !== undefined) {
      this.hairRow = hairRow;
      this.hair = scene.add.sprite(x, y, "hairs_char", hairRow * 4);
      this.hair.setScale(this.baseScale);
      this.hair.setDepth(this.depth + 1);
    }
  }

  // 헤어 스프라이트를 베이스와 동기화(위치/좌우반전/깊이/프레임).
  // hairs_char 프레임 = 베이스 프레임(0..3) + hairRow*4
  private syncHair(): void {
    if (!this.hair) return;
    this.hair.setPosition(this.x, this.y);
    this.hair.setFlipX(this.flipX);
    this.hair.setDepth(this.depth + 1);
    this.hair.setFrame(Number(this.frame.name) + this.hairRow * 4);
  }

  public destroy(fromScene?: boolean): void {
    this.hair?.destroy(fromScene);
    super.destroy(fromScene);
  }

  get getDirection() {
    return this.direction;
  }

  set setDirection(d: typeof this.direction) {
    this.direction = d;
  }

  private updateDirection({ vx, vy }: IMovement) {
    if (vx > 0) this.direction = "left";
    else if (vx < 0) this.direction = "right";
    else if (vy < 0) this.direction = "up";
    else if (vy > 0) this.direction = "down";
  }

  private move({ vx, vy }: IMovement): void {
    const body = this.body as Physics.Arcade.Body;
    body.setVelocity(vx, vy);
    body.velocity.normalize().scale(this.baseSpeed);
  }

  // private moveCharacter(direction, isRunning = false) {
  //   if (this._isMoving) {
  //     return;
  //   }
  //   this._isRunning = isRunning;
  //   this._moveSprite(direction);
  // }

  protected applyFacing(): void {
    this.setFlipX(this.direction === "right");
  }

  protected registerAnimations(): void {
    const a = this.scene.anims;
    const key = this.texture.key;
    if (a.exists(`${key}-idle`)) return;

    a.create({
      key: `${key}-idle`,
      frames: a.generateFrameNumbers(key, { frames: [0, 1] }),
      frameRate: 3,
      repeat: -1,
    });
    a.create({
      key: `${key}-walk`,
      frames: a.generateFrameNumbers(key, { frames: [2, 3] }),
      frameRate: 8,
      repeat: -1,
    });
  }

  protected updateAnimation(movement: IMovement): void {
    const key = this.texture.key;
    const idle = movement.vx === 0 && movement.vy === 0;
    this.play(`${key}-${idle ? "idle" : "walk"}`, true);
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const movement = this.getMovement(delta);
    this.move(movement);
    this.updateDirection(movement);
    this.applyFacing();
    this.updateAnimation(movement);
    this.syncHair();
  }
}
