import { Input, Scene, Types } from 'phaser'
import { DIRECTION, WorldPos } from './constants/constants'

// 퀵바 키 순서 = 슬롯 인덱스. 배열 인덱스가 곧 0-based 슬롯 번호.
// "1"(ONE) → 0, "2"(TWO) → 1, ... "9"(NINE) → 8, "0"(ZERO) → 9
const QUICKBAR_KEY_NAMES = [
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'ZERO'
] as const

export class Controls {
  #scene: Scene
  #cursorKeys: Types.Input.Keyboard.CursorKeys | undefined
  #wasdKeys: Record<string, Input.Keyboard.Key> | undefined
  private lockPlayerInput: boolean
  #enterKey: Input.Keyboard.Key | undefined
  #eKey: Input.Keyboard.Key | undefined
  #shiftKey: Input.Keyboard.Key | undefined
  #escKey: Input.Keyboard.Key | undefined
  //#fKey: Input.Keyboard.Key | undefined
  #cKey: Input.Keyboard.Key | undefined
  #numberKeys: Record<string, Input.Keyboard.Key> | undefined

  constructor(scene: Scene) {
    this.#scene = scene
    this.#cursorKeys = this.#scene.input.keyboard?.createCursorKeys()
    this.#enterKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.ENTER)
    this.#escKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.ESC)

    this.#wasdKeys = this.#scene.input.keyboard?.addKeys('w, a, s, d') as Record<
      string,
      Input.Keyboard.Key
    >
    this.#eKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.E)
    this.#shiftKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.SHIFT)
    //this.#fKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.F)
    this.#cKey = this.#scene.input.keyboard?.addKey(Input.Keyboard.KeyCodes.C)
    this.#numberKeys = this.#scene.input.keyboard?.addKeys(
      'ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,ZERO'
    ) as Record<string, Input.Keyboard.Key>
    this.lockPlayerInput = false
  }
  // when moving between scenes
  get isInputLocked() {
    return this.lockPlayerInput
  }

  set lockInput(val: boolean) {
    this.lockPlayerInput = val
  }

  isESCKeyDown() {
    if (this.#escKey === undefined) {
      return false
    }
    return this.#escKey.isDown
  }

  // 토글용: 누른 순간 한 번만 true. pause↔resume 깜빡임 방지.
  wasESCKeyPressed() {
    if (this.#escKey === undefined) {
      return false
    }
    return Input.Keyboard.JustDown(this.#escKey)
  }

  isShiftKeyDown() {
    if (this.#shiftKey === undefined) {
      return false
    }
    return this.#shiftKey.isDown
  }

  wasEnterKeyPressed() {
    if (this.#enterKey === undefined) {
      return false
    }
    return Input.Keyboard.JustDown(this.#enterKey)
  }

  wasCKeyPressed() {
    if (this.#cKey === undefined) {
      return false
    }
    return Input.Keyboard.JustDown(this.#cKey)
  }

  wasEKeyPressed() {
    if (this.#eKey === undefined) {
      return false
    }
    return Input.Keyboard.JustDown(this.#eKey)
  }

  wasNumberKeyPressed() {
    if (this.#numberKeys === undefined) {
      return -1
    }
    for (let i = 0; i < QUICKBAR_KEY_NAMES.length; i++) {
      const key = this.#numberKeys[QUICKBAR_KEY_NAMES[i]]
      if (key && Input.Keyboard.JustDown(key)) {
        return i
      }
    }
    return -1
  }

  getPointerWorldPos(): WorldPos {
    const p = this.#scene.input.activePointer
    const world = this.#scene.cameras.main.getWorldPoint(p.x, p.y)
    return { x: world.x, y: world.y }
  }

  isPointerDown(): boolean {
    return this.#scene.input.activePointer.isDown
  }

  getDirectionKeyPressed() {
    if (this.#cursorKeys === undefined || this.#wasdKeys === undefined) {
      return DIRECTION.NONE
    }

    const isLeftPressed = this.#cursorKeys.left.isDown || this.#wasdKeys.a.isDown
    const isRightPressed = this.#cursorKeys.right.isDown || this.#wasdKeys?.d.isDown
    const isUpPressed = this.#cursorKeys.up.isDown || this.#wasdKeys?.w.isDown
    const isDownPressed = this.#cursorKeys.down.isDown || this.#wasdKeys?.s.isDown
    let selectedDirection: (typeof DIRECTION)[keyof typeof DIRECTION] = DIRECTION.NONE

    if (isLeftPressed) {
      selectedDirection = DIRECTION.LEFT
      if (isUpPressed) {
        selectedDirection = DIRECTION.UPLEFT
      }
      if (isDownPressed) {
        selectedDirection = DIRECTION.DOWNLEFT
      }
    }
    if (isRightPressed) {
      selectedDirection = DIRECTION.RIGHT
      if (isUpPressed) {
        selectedDirection = DIRECTION.UPRIGHT
      }
      if (isDownPressed) {
        selectedDirection = DIRECTION.DOWNRIGHT
      }
    }

    if (isUpPressed) {
      selectedDirection = DIRECTION.UP
      if (isLeftPressed) {
        selectedDirection = DIRECTION.UPLEFT
      }
      if (isRightPressed) {
        selectedDirection = DIRECTION.UPRIGHT
      }
    }

    if (isDownPressed) {
      selectedDirection = DIRECTION.DOWN
      if (isLeftPressed) {
        selectedDirection = DIRECTION.DOWNLEFT
      }
      if (isRightPressed) {
        selectedDirection = DIRECTION.DOWNRIGHT
      }
    }

    return selectedDirection
  }
}
