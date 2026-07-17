import { Scene } from 'phaser'
import { Character } from './Character'
import { WorldPos } from '../../game/utils/constants/constants'

export class Player extends Character {
  constructor(scene: Scene, startPos: WorldPos, textureKey: string) {
    super({})
    this.charSprite = scene.add
      .sprite(startPos.x, startPos.y, textureKey, 0)
      .setScale(3)
      .setDepth(2)
    scene.add.existing(this.charSprite)
    this.charSprite.play(`${this.charSprite.texture.key}-idle`)
  }
}
