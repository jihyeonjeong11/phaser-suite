import { Input, Scene, Types } from "phaser";
import { DIRECTION } from "./constants/constants";

// 퀵바 키 순서 = 슬롯 인덱스. 배열 인덱스가 곧 0-based 슬롯 번호.
// "1"(ONE) → 0, "2"(TWO) → 1, ... "9"(NINE) → 8, "0"(ZERO) → 9
const QUICKBAR_KEY_NAMES = [
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "ZERO",
] as const;

export class Controls {
  #scene: Scene;
  #cursorKeys: Types.Input.Keyboard.CursorKeys | undefined;
  private lockPlayerInput: boolean;
  #enterKey: Input.Keyboard.Key | undefined;

  #fKey: Input.Keyboard.Key | undefined;
  #cKey: Input.Keyboard.Key | undefined;
  #numberKeys: Record<string, Input.Keyboard.Key> | undefined;

  constructor(scene: Scene) {
    this.#scene = scene;
    this.#cursorKeys = this.#scene.input.keyboard?.createCursorKeys();
    this.#enterKey = this.#scene.input.keyboard?.addKey(
      Input.Keyboard.KeyCodes.ENTER,
    );
    this.#fKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.F);
    this.#cKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.C);
    this.#numberKeys = this.#scene.input.keyboard?.addKeys(
      "ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,ZERO",
    ) as Record<string, Input.Keyboard.Key>;
    this.lockPlayerInput = false;
  }
  // when moving between scenes
  get isInputLocked() {
    return this.lockPlayerInput;
  }

  set lockInput(val: boolean) {
    this.lockPlayerInput = val;
  }
  wasEnterKeyPressed() {
    if (this.#enterKey === undefined) {
      return false;
    }
    return Input.Keyboard.JustDown(this.#enterKey);
  }

  wasCKeyPressed() {
    if (this.#cKey === undefined) {
      return false;
    }
    return Input.Keyboard.JustDown(this.#cKey);
  }

  wasQuickbarSlotJustPressed() {
    if (this.#numberKeys === undefined) {
      return -1;
    }
    for (let i = 0; i < QUICKBAR_KEY_NAMES.length; i++) {
      const key = this.#numberKeys[QUICKBAR_KEY_NAMES[i]];
      if (key && Input.Keyboard.JustDown(key)) {
        return i;
      }
    }
    return -1;
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
