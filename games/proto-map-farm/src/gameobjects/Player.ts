import { GameObjects, Scene } from 'phaser'
import { Character, IMovement } from './Character'
import { Weapon } from './Weapon'
import { Tool } from './Tool'
import { dataManager, InventoryItem, TEMP_INV_LIMIT } from '../game/managers/Store'

export class Player extends Character {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys
  private hand?: Weapon | Tool | null
  private wasMoving = false

  constructor(scene: Scene, x: number, y: number, textureKey: string) {
    super(scene, x, y, textureKey)
    this.cursors = scene.input.keyboard!.createCursorKeys()
    scene.input.on('pointerdown', () => this.shoot())
    this.registerQuickBarKeys(scene)
  }

  equip(item: Weapon | Tool): void {
    if (this.hand) this.hand.destroy()
    this.hand = item
    item.setDepth(this.depth + 1)
  }

  private registerQuickBarKeys(scene: Scene): void {
    const kb = scene.input.keyboard!
    const keyNames = [
      'ONE',
      'TWO',
      'THREE',
      'FOUR',
      'FIVE',
      'SIX',
      'SEVEN',
      'EIGHT',
      'NINE',
      'ZERO'
    ]
    keyNames
      .slice(0, TEMP_INV_LIMIT)
      .forEach((name, i) => kb.on(`keydown-${name}`, () => this.selectSlot(i)))
  }

  private selectSlot(index: number): void {
    dataManager.setCurrentSelectedIdx(index)
    const inv = dataManager.getInventory()
    const item = inv?.[index]
    if (!item) {
      this.unequip()
      return
    }
    this.equip(this.createHand(item))
  }

  private createHand(item: InventoryItem): Weapon | Tool {
    if (item.frame === undefined) {
      return new Weapon(this.scene, this.x, this.y, item.textureKey)
    }
    return new Tool(this.scene, this.x, this.y, item.textureKey, item.frame)
  }

  private unequip(): void {
    if (this.hand) this.hand.destroy()
    this.hand = null
  }

  shoot(): void {
    if (this.hand instanceof Weapon) this.hand.fire()
  }

  getBullets(): GameObjects.Group | undefined {
    return this.hand instanceof Weapon ? this.hand.getBullets() : undefined
  }

  public preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta)
    this.updateAim()
    this.hand?.updateOffset(this, this.getDirection)
    this.savePositionOnStop()
  }

  // 이동 중 -> 정지로 바뀌는 첫 프레임에만 현재 좌표를 store에 저장
  private savePositionOnStop(): void {
    const { vx, vy } = this.getMovement()
    const isMoving = vx !== 0 || vy !== 0
    if (this.wasMoving && !isMoving) {
      dataManager.setPlayerData({ x: this.x, y: this.y })
    }
    this.wasMoving = isMoving
  }

  private updateAim(): void {
    if (this.hand instanceof Weapon) {
      const pointer = this.scene.input.activePointer
      const wp = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y)
      const angle = Math.atan2(wp.y - this.y, wp.x - this.x)
      this.hand.setRotation(angle)
    }
  }

  protected getMovement(): IMovement {
    const c = this.cursors
    return {
      vx: (c.right.isDown ? 1 : 0) - (c.left.isDown ? 1 : 0),
      vy: (c.down.isDown ? 1 : 0) - (c.up.isDown ? 1 : 0)
    }
  }
}
