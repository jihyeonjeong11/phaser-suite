import { Scene } from 'phaser'
import { Character } from './Character'
import { WorldPos } from '../../game/utils/constants/constants'

export class Enemy extends Character {
  constructor(scene: Scene, startPos: WorldPos, textureKey: string, frame: number) {
    super()
    this.charSprite = scene.add
      .sprite(startPos.x, startPos.y, textureKey, frame)
      .setScale(1.5)
      .setDepth(2)
    scene.add.existing(this.charSprite)
  }
}
