import { Physics, Scene } from 'phaser'
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
    scene.physics.add.existing(this.charSprite)
    this.charSprite.body as Physics.Arcade.Body

    const idleKey = `${properties.textureKey}_idle`
    if (scene.anims.exists(idleKey)) {
      this.charSprite.play(idleKey)
    }
  }

  update(target: WorldPos, time: number): void {
    const body = this.charSprite.body as Physics.Arcade.Body
    const dx = target.x - this.charSprite.x
    const dy = target.y - this.charSprite.y
    const speed = this.properties.baseSpeed // px/초 (velocity)

    if (this.properties.awarness > Math.abs(dx) + Math.abs(dy) || true) {
      this.charSprite.scene.physics.moveTo(this.charSprite, target.x, target.y, speed)
      this.applyAnim(body)
      return
    }

    // wander/idle 상태를 1초마다 토글 (상태 전환만 시간 게이트).
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

    if (this.prevAction === 'wander') this.setWanderVelocity(body, speed)
    else body.setVelocity(0, 0)
    this.applyAnim(body)
  }

  private setWanderVelocity(body: Physics.Arcade.Body, speed: number): void {
    let vx = 0
    let vy = 0
    if (this.wanderDir === DIRECTION.LEFT) vx = -speed
    else if (this.wanderDir === DIRECTION.RIGHT) vx = speed
    else if (this.wanderDir === DIRECTION.UP) vy = -speed
    else if (this.wanderDir === DIRECTION.DOWN) vy = speed
    body.setVelocity(vx, vy)
  }

  // velocity 크기로 walk/idle, x부호로 좌우 flip 결정.
  private applyAnim(body: Physics.Arcade.Body): void {
    const moving = body.velocity.x !== 0 || body.velocity.y !== 0
    if (body.velocity.x !== 0) this.charSprite.setFlipX(body.velocity.x < 0)
    const key = `${this.charSprite.texture.key}_${moving ? 'walk' : 'idle'}`
    if (this.charSprite.anims.currentAnim?.key !== key) this.charSprite.play(key)
  }
}
