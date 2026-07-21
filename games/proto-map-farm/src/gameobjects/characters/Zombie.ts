import { Scene } from 'phaser'
import { Character } from './Character'
import { WorldPos } from '../../game/utils/constants/constants'

export class Zombie extends Character {
  constructor(scene: Scene, startPos: WorldPos, textureKey: string, frame: number) {
    super()
    this.charSprite = scene.add.sprite(startPos.x, startPos.y, textureKey, frame).setDepth(2)
    scene.add.existing(this.charSprite)

    const idleKey = `${textureKey}_idle`
    if (scene.anims.exists(idleKey)) {
      this.charSprite.play(idleKey)
    }
  }
}
