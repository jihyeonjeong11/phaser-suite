import { GameObjects, Scene } from 'phaser'
import { InventoryItem } from '../../game/managers/Store'

// 플레이어가 손에 든 무기 스프라이트. 매 프레임 owner(캐릭터)를 따라다니며
// 바라보는 방향(flipX)에 맞춰 좌우로 반전한다.
export class Hand {
  private sprite: GameObjects.Sprite
  private owner: GameObjects.Sprite

  // 오른쪽을 바라볼 때 기준 오프셋. 무기를 허리춤에서 앞으로 쥔 느낌을 준다.
  private static readonly OFFSET_X = 8
  private static readonly OFFSET_Y = 6

  constructor(scene: Scene, owner: GameObjects.Sprite, item: InventoryItem) {
    this.owner = owner
    this.sprite = scene.add
      .sprite(owner.x, owner.y, item.textureKey, item.frame ?? 0)
      .setOrigin(0.5)
      .setDepth(owner.depth + 1)
    this.sync()
  }

  // Game.update → Player.update에서 매 프레임 호출. 캐릭터 위치/방향에 무기를 붙인다.
  sync(): void {
    const facingLeft = this.owner.flipX
    const dir = facingLeft ? -1 : 1
    this.sprite.setFlipX(facingLeft)
    this.sprite.setPosition(
      this.owner.x + Hand.OFFSET_X * dir,
      this.owner.y + Hand.OFFSET_Y
    )
  }

  destroy(): void {
    this.sprite.destroy()
  }
}
