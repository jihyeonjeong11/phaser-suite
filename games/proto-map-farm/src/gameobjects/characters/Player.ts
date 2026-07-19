import { Scene, Tilemaps } from 'phaser'
import { Character } from './Character'
import { DIRECTION, DirectionOrNone, WorldPos } from '../../game/utils/constants/constants'

export class Player extends Character {
  private portalLayer: Tilemaps.ObjectLayer | null
  private onEnterPortal: (dest: string) => void

  constructor(
    scene: Scene,
    startPos: WorldPos,
    textureKey: string,
    portalLayer: Tilemaps.ObjectLayer | null,
    onEnterPortal: (dest: string) => void
  ) {
    super()
    this.portalLayer = portalLayer
    this.onEnterPortal = onEnterPortal
    this.charSprite = scene.add
      .sprite(startPos.x, startPos.y, textureKey, 0)
      .setScale(3)
      .setDepth(2)
    scene.add.existing(this.charSprite)
  }

  moveCharacter(directionKey: DirectionOrNone) {
    super.moveCharacter(directionKey)
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
}
