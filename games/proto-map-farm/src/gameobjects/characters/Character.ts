// 슈퍼클래스 — Sprite 상속(x/y는 이미 GameObject가 소유), position/direction/baseSpeed/hair만 베이스에. HP·stamina·store 의존 없음

import { GameObjects, Scene } from 'phaser'

export abstract class Character {
  charSprite: GameObjects.Sprite
  // needsToClarify: should I store x,y or not?
  baseSpeed: 3
  baseHp: 100
  // todo: running juice / tool using juice
  baseStamina: 100
  // param: config - 어떤 sprite를 쓸것인지 확정 필요함.
  constructor() {
    // if (this.constructor === Character) {
    //   throw new Error('Character is an abstract class and cannot be instantiated.')
    // }
  }

  public getSprite() {
    return this.charSprite
  }
}
