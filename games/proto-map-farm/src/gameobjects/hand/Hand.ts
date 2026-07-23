import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import { InventoryItem } from '../../game/managers/Store'
import { WorldPos } from '../../game/utils/constants/constants'
import { Bullet } from '../Bullet'
import { playSound } from '../../game/utils/audios'
import { AUDIO_KEYS } from '../../game/utils/constants/audioKeys'

export class Hand {
  private scene: Scene
  private sprite: GameObjects.Sprite
  private owner: GameObjects.Sprite
  private rotation: number
  private bullets: GameObjects.Group
  private attackPower: number
  private bulletVelocity: number
  private lastFired = 0

  private static readonly OFFSET_X = 8
  private static readonly OFFSET_Y = 6
  private static readonly FIRE_RATE = 250
  // 아이템에 bulletVelocity가 없을 때의 기본 속도
  private static readonly DEFAULT_BULLET_SPEED = 600

  constructor(
    scene: Scene,
    owner: GameObjects.Sprite,
    item: InventoryItem,
    bullets: GameObjects.Group
  ) {
    this.scene = scene
    this.rotation = 0
    this.owner = owner
    this.bullets = bullets
    this.attackPower = item.attackPower ?? 0
    this.bulletVelocity = item.bulletVelocity ?? Hand.DEFAULT_BULLET_SPEED
    this.sprite = scene.add
      .sprite(owner.x, owner.y, item.textureKey, item.frame ?? 0)
      .setOrigin(0.2, 0.5)
      .setDepth(owner.depth + 1)
    this.sync({ x: owner.x + 1, y: owner.y })
  }

  sync(aim: WorldPos): void {
    const px = this.owner.x + Hand.OFFSET_X
    const py = this.owner.y + Hand.OFFSET_Y
    this.rotation = PhaserMath.Angle.Between(px, py, aim.x, aim.y)

    this.sprite.setPosition(px, py)
    this.sprite.setRotation(this.rotation)
    this.sprite.setFlipY(Math.abs(this.rotation) > Math.PI / 2)
  }

  // 클릭(누름) 시 매 프레임 호출. fire-rate로 연사 속도를 제한한다.
  fire(now: number): void {
    if (now < this.lastFired + Hand.FIRE_RATE) return
    this.lastFired = now

    // 총구(muzzle)는 스프라이트 origin 반대편 끝. 회전각 방향으로 밀어낸다.
    const muzzle = (1 - this.sprite.originX) * this.sprite.displayWidth
    const mx = this.sprite.x + Math.cos(this.rotation) * muzzle
    const my = this.sprite.y + Math.sin(this.rotation) * muzzle

    const bullet = new Bullet(
      this.scene,
      mx,
      my,
      this.rotation,
      this.bulletVelocity,
      this.attackPower
    )
    this.bullets.add(bullet)
    playSound(this.scene, AUDIO_KEYS.GUNFIRE)
  }

  destroy(): void {
    this.sprite.destroy()
  }
}
