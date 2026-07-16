import { Scene } from 'phaser'
import { Character } from './Character'
import { POS } from '../../game/utils/constants/constants'

export class Player extends Character {
  constructor(scene: Scene, pos: POS) {
    super({})
    this.charSprite = scene.add.sprite(pos.x, pos.y, 'base_char', 0).setScale(3)
  }
}
