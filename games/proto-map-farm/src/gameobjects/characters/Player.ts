import { Physics, Scene, Tilemaps } from 'phaser'
import { Character } from './Character'
import { DIRECTION, DirectionOrNone, WorldPos } from '../../game/utils/constants/constants'
import { Worldmap } from '../Worldmap'

export class Player extends Character {
  private portalLayer: Tilemaps.ObjectLayer | null
  private onEnterPortal: (dest: string) => void

  private computedSpeed: number
  private computedStamina: number
  private computedHP: number
  private isExhausted = false

  private static readonly STAMINA_DRAIN_RATE = 25
  private static readonly STAMINA_REGEN_DELAY_MS = 600
  private static readonly STAMINA_REGEN_RAMP_MS = 1500
  private static readonly STAMINA_REGEN_MAX_RATE = 30
  private static readonly EXHAUSTION_RECOVER_RATIO = 0.4

  private regenDelayRemainingMs = 0
  private regenRampElapsedMs = 0

  private static readonly INVINCIBLE_DURATION_MS = 1000
  private static readonly FLICKER_INTERVAL_MS = 60
  public temporarilyInvincible = false
  private invincibilityRemainingMs = 0

  constructor(
    scene: Scene,
    startPos: WorldPos,
    textureKey: string,
    portalLayer: Tilemaps.ObjectLayer | null,
    onEnterPortal: (dest: string) => void,
    worldMap: Worldmap
  ) {
    super(worldMap)
    this.computedHP = this.baseHp
    this.computedStamina = this.baseStamina
    this.computedSpeed = this.baseSpeed
    this.portalLayer = portalLayer
    this.onEnterPortal = onEnterPortal
    this.charSprite = scene.add.sprite(startPos.x, startPos.y, textureKey, 0).setDepth(2)
    scene.add.existing(this.charSprite)
    scene.physics.add.existing(this.charSprite)
    // 1:1.5 테스트본(base_char_ratio15w_test): content 39×57, x[12..50] y[4..60] 실측
    const body = this.charSprite.body as Physics.Arcade.Body
    body.setSize(39, 57)
    body.setOffset(12, 4)
  }

  updateStamina(deltaMs: number, wantsSprint: boolean): boolean {
    const canSprint = wantsSprint && !this.isExhausted && this.computedStamina > 0

    if (canSprint) {
      this.drainStamina(deltaMs)
    } else {
      this.regenStamina(deltaMs)
    }

    return canSprint
  }

  getPlayerPos(): WorldPos {
    return { x: this.charSprite.x, y: this.charSprite.y }
  }

  private drainStamina(deltaMs: number): void {
    this.computedStamina = Math.max(
      0,
      this.computedStamina - Player.STAMINA_DRAIN_RATE * (deltaMs / 1000)
    )
    this.regenDelayRemainingMs = Player.STAMINA_REGEN_DELAY_MS
    this.regenRampElapsedMs = 0

    if (this.computedStamina <= 0) {
      this.isExhausted = true
    }
  }

  private regenStamina(deltaMs: number): void {
    if (this.computedStamina >= this.baseStamina) {
      this.regenRampElapsedMs = 0
      return
    }

    if (this.regenDelayRemainingMs > 0) {
      this.regenDelayRemainingMs = Math.max(0, this.regenDelayRemainingMs - deltaMs)
      return
    }

    this.regenRampElapsedMs += deltaMs
    const rampProgress = Math.min(1, this.regenRampElapsedMs / Player.STAMINA_REGEN_RAMP_MS)
    const easedRate = Player.STAMINA_REGEN_MAX_RATE * rampProgress * rampProgress // ease-in

    this.computedStamina = Math.min(
      this.baseStamina,
      this.computedStamina + easedRate * (deltaMs / 1000)
    )

    if (
      this.isExhausted &&
      this.computedStamina >= this.baseStamina * Player.EXHAUSTION_RECOVER_RATIO
    ) {
      this.isExhausted = false
    }
  }

  moveCharacter(directionKey: DirectionOrNone, isRunning = false) {
    super.moveCharacter(directionKey, isRunning)

    const animKey =
      directionKey !== DIRECTION.NONE
        ? `${this.charSprite.texture.key}_walk`
        : `${this.charSprite.texture.key}_idle`

    if (!this.charSprite.anims.isPlaying || this.charSprite.anims.currentAnim?.key !== animKey) {
      this.charSprite.play(animKey)
    }

    const dest = this.findPortalProperties(this.charSprite.x, this.charSprite.y)
    if (dest) this.onEnterPortal(dest)
  }
  // 플레이어 오브젝트는 character에서 관리할 것.
  // todo: 플레이어와 오브젝트 레이어 오브젝트는 하나의 rentangle로 맵 오브젝트에서 관리해야 함.
  private static readonly PORTAL_HIT_RADIUS = 16

  private findPortalProperties(x: number, y: number): string | null {
    if (!this.portalLayer) return null
    const portal = this.portalLayer.objects.find((obj) => {
      if (obj.x == null || obj.y == null) return false
      return (
        Math.abs(x - obj.x) <= Player.PORTAL_HIT_RADIUS &&
        Math.abs(y - obj.y) <= Player.PORTAL_HIT_RADIUS
      )
    })
    if (!portal) return null

    const dest = portal.properties?.find(
      (p: { name: string; value: unknown }) => p.name === 'dest'
    )?.value

    return typeof dest === 'string' ? dest : null
  }

  takeDamage(attackPower = 0) {
    if (this.temporarilyInvincible) return
    this.computedHP -= attackPower
    this.temporarilyInvincible = true
    this.invincibilityRemainingMs = Player.INVINCIBLE_DURATION_MS
  }

  update(deltaMs: number): void {
    if (!this.temporarilyInvincible) return

    this.invincibilityRemainingMs -= deltaMs
    if (this.invincibilityRemainingMs <= 0) {
      this.temporarilyInvincible = false
      this.charSprite.setAlpha(1)
      return
    }

    const on = Math.floor(this.invincibilityRemainingMs / Player.FLICKER_INTERVAL_MS) % 2 === 0
    this.charSprite.setAlpha(on ? 0.3 : 1)
  }
}
