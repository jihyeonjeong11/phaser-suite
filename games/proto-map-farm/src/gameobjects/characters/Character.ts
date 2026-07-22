// 슈퍼클래스 — Sprite 상속(x/y는 이미 GameObject가 소유), position/direction/baseSpeed/hair만 베이스에.

import { GameObjects } from 'phaser'
import { DIRECTION, DirectionOrNone, WorldPos } from '../../game/utils/constants/constants'
import { Worldmap } from '../Worldmap'

export abstract class Character {
  charSprite: GameObjects.Sprite
  // needsToClarify: should I store x,y or not?
  baseSpeed: number = 3
  baseHp: number = 100
  // todo: running juice / tool using juice
  baseStamina: number = 100
  // param: config - 어떤 sprite를 쓸것인지 확정 필요함.
  isMoving: boolean
  protected worldMap: Worldmap
  constructor(worldMap: Worldmap) {
    this.isMoving = false
    this.worldMap = worldMap
    if (this.constructor === Character) {
      throw new Error('Character is an abstract class and cannot be instantiated.')
    }
  }

  public getSprite() {
    return this.charSprite
  }

  moveCharacter(directionKey: DirectionOrNone, isRunning = false, stepDistance?: number) {
    let dest: WorldPos = { x: 0, y: 0 }

    switch (directionKey) {
      case DIRECTION.LEFT: {
        this.charSprite.setFlipX(true)
        dest = { x: -1, y: 0 }
        break
      }
      case DIRECTION.UPLEFT: {
        this.charSprite.setFlipX(true)
        dest = { x: -1, y: -1 }
        break
      }
      case DIRECTION.DOWNLEFT: {
        this.charSprite.setFlipX(true)
        dest = { x: -1, y: 1 }
        break
      }
      case DIRECTION.RIGHT: {
        this.charSprite.setFlipX(false)
        dest = { x: 1, y: 0 }
        break
      }
      case DIRECTION.UPRIGHT: {
        this.charSprite.setFlipX(false)
        dest = { x: 1, y: -1 }
        break
      }
      case DIRECTION.DOWNRIGHT: {
        this.charSprite.setFlipX(false)
        dest = { x: 1, y: 1 }
        break
      }
      case DIRECTION.UP: {
        dest = { x: 0, y: -1 }
        break
      }
      case DIRECTION.DOWN: {
        dest = { x: 0, y: 1 }
        break
      }
      case DIRECTION.NONE: {
        break
      }
    }

    const speed = stepDistance ?? (isRunning ? this.baseSpeed + 0.5 : this.baseSpeed)

    const targetPos = {
      x: this.charSprite.x + dest.x * speed,
      y: this.charSprite.y + dest.y * speed
    }

    if (this.worldMap.isPassable(targetPos)) {
      this.charSprite.setPosition(targetPos.x, targetPos.y)
    }
  }
}
