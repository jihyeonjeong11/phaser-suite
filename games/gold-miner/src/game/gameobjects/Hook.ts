import { GameObjects, Math as PhaserMath, Scene, Sound } from "phaser";
import { HookState, HookStateType } from "../utils/types";
import {
  BASE_REEL_SPEED,
  HOOK_FIRE_SPEED,
  HOOK_MIN_LEN,
  HOOK_SWING_MAX_ANGLE,
  HOOK_SWING_MIN_ANGLE,
  HOOK_SWING_SPEED,
} from "../utils/constants";

export class Hook extends GameObjects.Container {
  #state: HookStateType = HookState.SWINGING;
  #swingAngle: number = HOOK_SWING_MIN_ANGLE;
  #ropeLength: number = HOOK_MIN_LEN;
  #image!: GameObjects.Image;
  #rope!: GameObjects.Graphics;
  #maxRopeLength: number = 0;
  #swingTime: number = 0;
  #reelSpeed: number = BASE_REEL_SPEED;
  #ropeSound!: Sound.BaseSound;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.#render();
    this.setDepth(11);

    this.scene.add.existing(this);
    this.#ropeSound = scene.sound.add("rope_creaking", {
      loop: true,
      volume: 0.6,
    });

    scene.input.on("pointerdown", () => {
      if (this.#state === HookState.SWINGING) {
        this.#maxRopeLength = this.#computeMaxRopeLength();
        this.#updateHookState(HookState.FIRING);
      }
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
    this.scene.sound.play("hook_catch");
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
    this.#image.setAngle(180 - PhaserMath.RadToDeg(this.#swingAngle));

    this.#rope.clear();
    this.#rope.lineStyle(3, 0x8b4513, 1);
    this.#rope.lineBetween(0, 0, tipX, tipY);
  }

  #computeMaxRopeLength(): number {
    const dx = Math.sin(this.#swingAngle);
    const dy = Math.cos(this.#swingAngle);
    const { width, height } = this.scene.scale;
    let minT = Infinity;

    if (dy > 0) minT = Math.min(minT, (height - this.y) / dy);
    if (dy < 0) minT = Math.min(minT, -this.y / dy);
    if (dx > 0) minT = Math.min(minT, (width - this.x) / dx);
    if (dx < 0) minT = Math.min(minT, -this.x / dx);

    return minT;
  }

  #updateHookState(newState: HookStateType) {
    this.#state = newState;
    if (newState === HookState.FIRING || newState === HookState.REELING) {
      if (!this.#ropeSound.isPlaying) this.#ropeSound.play();
    } else {
      this.#ropeSound.stop();
    }
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
