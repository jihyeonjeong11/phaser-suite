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
        this.#ropeLength -= BASE_REEL_SPEED * (dt / 1000);
        if (this.#ropeLength <= HOOK_MIN_LEN) {
          this.#ropeLength = HOOK_MIN_LEN;
          this.#updateHookState(HookState.SWINGING);
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
