import Phaser from "phaser";
import { HookState, HookStateType } from "../utils/types";
import {
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

  readonly #maxRopeLength: number;
  #swingTime: number = 0;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.#maxRopeLength = scene.scale.height - y;
    this.render();
    this.scene.add.existing(this);
  }

  update(dt: number): void {
    this.#swingTime += dt / 1000;
    this.#swingAngle =
      Math.sin(this.#swingTime * HOOK_SWING_SPEED) * HOOK_SWING_MAX_ANGLE;
    const tipX = Math.sin(this.#swingAngle) * this.#ropeLength;
    const tipY = Math.cos(this.#swingAngle) * this.#ropeLength;
    this.#image.setPosition(tipX, tipY);
    this.#image.setAngle(180 - Phaser.Math.RadToDeg(this.#swingAngle));
  }

  private render() {
    this.#image = this.scene.add
      .image(0, 0, "hook")
      .setDisplaySize(32, 32)
      .setAngle(180);
    this.add(this.#image);
  }
}
