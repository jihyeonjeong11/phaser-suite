import { GameObjects, Math as PhaserMath, Scene } from 'phaser'
import { InventoryItem } from '../../game/managers/Store'
import { WorldPos } from '../../game/utils/constants/constants'
import { Bullet } from '../Bullet'
import { playSound } from '../../game/utils/audios'
import { AUDIO_KEYS } from '../../game/utils/constants/audioKeys'
// TODO: need weapon and tool class.-
// TODO: Hand > Weapon or Tool 구조로. 여기서는 useTool만 다룸.
// 현재 여기는 총만 다룸.
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
    this.bulletVelocity = item.bulletVelocity!
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

  fire(now: number): void {
    if (now < this.lastFired + Hand.FIRE_RATE) return
    this.lastFired = now

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
