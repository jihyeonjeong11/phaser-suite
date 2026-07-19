import { Scene } from 'phaser'
import { Character } from './Character'
import { DIRECTION, DirectionOrNone, WorldPos } from '../../game/utils/constants/constants'

export class Player extends Character {
  constructor(scene: Scene, startPos: WorldPos, textureKey: string) {
    super({})
    this.charSprite = scene.add
      .sprite(startPos.x, startPos.y, textureKey, 0)
      .setScale(3)
      .setDepth(2)
    scene.add.existing(this.charSprite)
    this.charSprite.play(`${this.charSprite.texture.key}_idle`)
  }
  moveCharacter(directionKey: DirectionOrNone) {
    super.moveCharacter(directionKey)
    const animKey =
      directionKey !== DIRECTION.NONE
        ? `${this.charSprite.texture.key}_walk`
        : `${this.charSprite.texture.key}_idle`

    if (!this.charSprite.anims.isPlaying || this.charSprite.anims.currentAnim?.key !== animKey) {
      this.charSprite.play(animKey)
    }
    // 포탈 확인 여부
    // 포탈 콜백
  }
}
