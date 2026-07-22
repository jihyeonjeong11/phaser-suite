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

  private static readonly STAMINA_DRAIN_RATE = 25 // 초당 소모량
  private static readonly STAMINA_REGEN_DELAY_MS = 600 // 스프린트를 멈춘 뒤 회복이 시작되기까지의 대기 시간
  private static readonly STAMINA_REGEN_RAMP_MS = 1500 // 회복 속도가 0에서 최대치까지 가속되는 데 걸리는 시간
  private static readonly STAMINA_REGEN_MAX_RATE = 30 // 가속이 끝난 뒤의 초당 회복량
  private static readonly EXHAUSTION_RECOVER_RATIO = 0.4 // 완전히 소진된 뒤 이 비율만큼 회복해야 다시 스프린트 가능

  private regenDelayRemainingMs = 0
  private regenRampElapsedMs = 0

  private static readonly INVINCIBLE_DURATION_MS = 1000 // 피격 후 무적 지속(스타듀는 1200)
  private static readonly FLICKER_INTERVAL_MS = 60 // 무적 중 깜빡임 주기
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
    scene.physics.add.existing(this.charSprite) // 겹침 판정용 Arcade 바디(이동은 여전히 수동 setPosition)
    // 히트박스: 현재 base_char는 64×64 좀비 복사본(46×57/9,4). base_char 재작성 후 재측정 필요.
    const body = this.charSprite.body as Physics.Arcade.Body
    body.setSize(46, 57)
    body.setOffset(9, 4)
  }

  // 매 프레임 호출. 탈진/스태미너 상태를 반영한 "실제 스프린트 가능 여부"를 반환한다.
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
    const easedRate = Player.STAMINA_REGEN_MAX_RATE * rampProgress * rampProgress // ease-in: 처음엔 느리게, 점점 빠르게

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
    if (this.temporarilyInvincible) return // 무적 중이면 데미지 무시 (overlap이 매 프레임 호출돼도 1회만 적용)
    this.computedHP -= attackPower
    this.temporarilyInvincible = true
    this.invincibilityRemainingMs = Player.INVINCIBLE_DURATION_MS
  }

  // 매 프레임 호출. 무적 타이머를 delta(ms)만큼 깎고, 만료 시 무적 해제 + 깜빡임 처리.
  update(deltaMs: number): void {
    if (!this.temporarilyInvincible) return

    this.invincibilityRemainingMs -= deltaMs
    if (this.invincibilityRemainingMs <= 0) {
      this.temporarilyInvincible = false
      this.charSprite.setAlpha(1) // 깜빡임 원복
      return
    }

    // FLICKER_INTERVAL_MS 주기로 반투명↔불투명 토글 → 피격 깜빡임 연출
    const on = Math.floor(this.invincibilityRemainingMs / Player.FLICKER_INTERVAL_MS) % 2 === 0
    this.charSprite.setAlpha(on ? 0.3 : 1)
  }
}
