import { Input, Scene, Types } from "phaser";
import { DIRECTION } from "./constants";

export class controls {
  /** @type {Phaser.Scene} */
  #scene: Scene;
  #cursorKeys: Types.Input.Keyboard.CursorKeys | undefined;
  #lockPlayerInput: boolean;
  #enterKey: Input.Keyboard.Key | undefined;
  #fKey: Input.Keyboard.Key | undefined;

  constructor(scene: Scene) {
    this.#scene = scene;
    this.#cursorKeys = this.#scene.input.keyboard?.createCursorKeys();
    this.#enterKey = this.#scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER,
    );
    this.#fKey = this.#scene.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.F,
    );
    this.#lockPlayerInput = false;
  }
  // when moving between scenes
  get isInputLocked() {
    return this.#lockPlayerInput;
  }
  // todo: implement pause or inventory scene
  wasEnterKeyPressed() {
    if (this.#enterKey === undefined) {
      return false;
    }
    return Phaser.Input.Keyboard.JustDown(this.#enterKey);
  }

  getDirectionKeyPressedDown() {
    if (this.#cursorKeys === undefined) {
      return DIRECTION.NONE;
    }

    let selectedDirection: (typeof DIRECTION)[keyof typeof DIRECTION] =
      DIRECTION.NONE;
    if (this.#cursorKeys.left.isDown) {
      selectedDirection = DIRECTION.LEFT;
    } else if (this.#cursorKeys.right.isDown) {
      selectedDirection = DIRECTION.RIGHT;
    } else if (this.#cursorKeys.up.isDown) {
      selectedDirection = DIRECTION.UP;
    } else if (this.#cursorKeys.down.isDown) {
      selectedDirection = DIRECTION.DOWN;
    }

    return selectedDirection;
  }
}
