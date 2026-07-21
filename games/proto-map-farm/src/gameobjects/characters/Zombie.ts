import { Scene } from 'phaser'
import { Character } from './Character'
import { DIRECTION, DirectionOrNone, WorldPos } from '../../game/utils/constants/constants'
import { Worldmap } from '../Worldmap'
import { EnemyDef } from '../../game/utils/constants/enemies'

export class Zombie extends Character {
  constructor(scene: Scene, startPos: WorldPos, zombie: EnemyDef, worldMap: Worldmap) {
    super(worldMap)
    this.charSprite = scene.add
      .sprite(startPos.x, startPos.y, zombie.textureKey, zombie.frame)
      .setDepth(2)
    this.baseSpeed = zombie.baseSpeed
    scene.add.existing(this.charSprite)

    const idleKey = `${zombie.textureKey}_idle`
    if (scene.anims.exists(idleKey)) {
      this.charSprite.play(idleKey)
    }
  }
  // 행동 ai
  // 목표: 플레이어를 발견하지 못햇을 시 랜덤 방향으로 이동, 발견했을 시 플레이어로 이동해서 플레이어가 있는 타일로 이동함
  // 플레이어와 좀비가 접촉하면 피해.(허트박스 미구현)
  // 미발견: 무작위로 배회
  // 발견: (좀비의 인지 범위에 플레이어가 접근햇을 때) 플레이어가 있는 타일로 이동
  // 인지 범위 외(소음 등 )미구현

  // step1: 인지 범위 무제한. 무조건 플레이어 쪽으로 이동한다.
  update(target: WorldPos): void {
    const dx = target.x - this.charSprite.x
    const dy = target.y - this.charSprite.y
    this.moveCharacter(this.toDirection(dx, dy))
  }

  private toDirection(dx: number, dy: number): DirectionOrNone {
    const DEAD_ZONE = 1 // 목표와 거의 겹치면 그 축은 무시(떨림 방지)
    const horizontal = Math.abs(dx) <= DEAD_ZONE ? '' : dx < 0 ? 'LEFT' : 'RIGHT'
    const vertical = Math.abs(dy) <= DEAD_ZONE ? '' : dy < 0 ? 'UP' : 'DOWN'
    const key = vertical + horizontal
    return key === '' ? DIRECTION.NONE : (key as DirectionOrNone)
  }
}
