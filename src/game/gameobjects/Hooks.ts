import Phaser from "phaser";
import { HookState, HookStateType } from "../utils/types";
import {
  BASE_REEL_SPEED,
  HOOK_FIRE_SPEED,
  HOOK_MIN_LEN,
  HOOK_SWING_MAX_ANGLE,
  HOOK_SWING_MIN_ANGLE,
  HOOK_SWING_SPEED,
} from "../utils/constants";

export class Hook extends Phaser.GameObjects.Container {
  #state: HookStateType = HookState.SWINGING;
  #swingAngle: number = HOOK_SWING_MIN_ANGLE;
  #ropeLength: number = HOOK_MIN_LEN;
  #image!: Phaser.GameObjects.Image;
  #rope!: Phaser.GameObjects.Graphics;

  readonly #maxRopeLength: number;
  #swingTime: number = 0;
  #reelSpeed: number = BASE_REEL_SPEED;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.#maxRopeLength = scene.scale.height - y;
    this.#render();

    this.scene.add.existing(this);

    scene.input.on("pointerdown", () => {
      if (this.#state === HookState.SWINGING)
        this.#updateHookState(HookState.FIRING);
    });
  }

  get tipWorldX(): number {
    return this.x + Math.sin(this.#swingAngle) * this.#ropeLength;
  }

  get tipWorldY(): number {
    return this.y + Math.cos(this.#swingAngle) * this.#ropeLength;
  }

  get hookState(): HookStateType {
    return this.#state;
  }

  catchObject(weight: number): void {
    this.#reelSpeed = BASE_REEL_SPEED / weight;
    this.#updateHookState(HookState.REELING);
  }

  update(dt: number): void {
    switch (this.#state) {
      case HookState.SWINGING:
        this.#swingTime += dt / 1000;
        this.#swingAngle =
          Math.sin(this.#swingTime * HOOK_SWING_SPEED) * HOOK_SWING_MAX_ANGLE;

        break;
      case HookState.FIRING:
        this.#ropeLength += HOOK_FIRE_SPEED * (dt / 1000);
        if (this.#ropeLength >= this.#maxRopeLength) {
          this.#ropeLength = this.#maxRopeLength;
          this.#updateHookState(HookState.REELING);
        }
        break;
      case HookState.REELING:
        this.#ropeLength -= this.#reelSpeed * (dt / 1000);
        if (this.#ropeLength <= HOOK_MIN_LEN) {
          this.#ropeLength = HOOK_MIN_LEN;
          this.#reelSpeed = BASE_REEL_SPEED;
          this.#updateHookState(HookState.SWINGING);
          this.emit("reelComplete");
        }
        break;
      default:
        break;
    }
    const tipX = Math.sin(this.#swingAngle) * this.#ropeLength;
    const tipY = Math.cos(this.#swingAngle) * this.#ropeLength;
    this.#image.setPosition(tipX, tipY);
    this.#image.setAngle(180 - Phaser.Math.RadToDeg(this.#swingAngle));

    this.#rope.clear();
    this.#rope.lineStyle(3, 0x8b4513, 1);
    this.#rope.lineBetween(0, 0, tipX, tipY);
  }

  #updateHookState(newState: HookStateType) {
    this.#state = newState;
  }

  #render() {
    this.#rope = this.scene.add.graphics();
    this.add(this.#rope);
    this.#image = this.scene.add
      .image(0, 0, "hook")
      .setDisplaySize(48, 48)
      .setAngle(180);
    this.add(this.#image);
  }
}
