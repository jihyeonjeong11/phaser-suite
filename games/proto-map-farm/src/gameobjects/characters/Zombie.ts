import { Scene } from 'phaser'
import { Character } from './Character'
import { DIRECTION, DirectionOrNone, WorldPos } from '../../game/utils/constants/constants'
import { Worldmap } from '../Worldmap'
import { EnemyDef } from '../../game/utils/constants/enemies'

export class Zombie extends Character {
  properties: EnemyDef
  timeBeforeAIMovementAgain: number = 0
  prevAction: 'wander' | 'idle'
  private wanderDir: DirectionOrNone = DIRECTION.NONE
  constructor(scene: Scene, startPos: WorldPos, properties: EnemyDef, worldMap: Worldmap) {
    super(worldMap)
    this.properties = properties
    this.prevAction = 'idle'
    this.charSprite = scene.add
      .sprite(startPos.x, startPos.y, properties.textureKey, properties.frame)
      .setDepth(2)
    this.baseSpeed = properties.baseSpeed
    scene.add.existing(this.charSprite)
    scene.physics.add.existing(this.charSprite) // 겹침 판정용 Arcade 바디

    const idleKey = `${properties.textureKey}_idle`
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

  update(target: WorldPos, time: number): void {
    const dx = target.x - this.charSprite.x
    const dy = target.y - this.charSprite.y

    // todo: need statemachine
    if (this.properties.awarness > Math.abs(dx) + Math.abs(dy)) {
      this.moveCharacter(this.toDirection(dx, dy))
      return
    }

    if (time >= this.timeBeforeAIMovementAgain) {
      this.timeBeforeAIMovementAgain = time + this.properties.aiDuration
      if (this.prevAction === 'idle') {
        this.prevAction = 'wander'
        const dirs = [DIRECTION.LEFT, DIRECTION.RIGHT, DIRECTION.UP, DIRECTION.DOWN]
        this.wanderDir = dirs[Math.floor(Math.random() * dirs.length)]
      } else {
        this.prevAction = 'idle'
      }
    }

    this.moveCharacter(this.prevAction === 'wander' ? this.wanderDir : DIRECTION.NONE)
  }

  moveCharacter(directionKey: DirectionOrNone, isRunning = false, stepDistance?: number) {
    super.moveCharacter(directionKey, isRunning, stepDistance)

    const animKey =
      directionKey !== DIRECTION.NONE
        ? `${this.charSprite.texture.key}_walk`
        : `${this.charSprite.texture.key}_idle`

    if (!this.charSprite.anims.isPlaying || this.charSprite.anims.currentAnim?.key !== animKey) {
      this.charSprite.play(animKey)
    }
  }

  private toDirection(dx: number, dy: number): DirectionOrNone {
    const DEAD_ZONE = 1 // 목표와 거의 겹치면 그 축은 무시(떨림 방지)
    const horizontal = Math.abs(dx) <= DEAD_ZONE ? '' : dx < 0 ? 'LEFT' : 'RIGHT'
    const vertical = Math.abs(dy) <= DEAD_ZONE ? '' : dy < 0 ? 'UP' : 'DOWN'
    const key = vertical + horizontal
    return key === '' ? DIRECTION.NONE : (key as DirectionOrNone)
  }
}
