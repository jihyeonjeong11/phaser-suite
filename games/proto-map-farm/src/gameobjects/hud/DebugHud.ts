import { Scene, Display } from 'phaser'
import { MapObject } from '../mapObjects/MapObjects'

// P키 하나로 모든 디버그 오버레이를 토글한다.
//  - 충돌(World 레이어) : renderDebug (정적, 1회)
//  - 포탈 존           : (정적, 1회)
//  - 점유 타일(빨강)    : isTileOccupied == true, 인터랙션 불가 (동적, 매 프레임)
//  - 갈린 흙(초록)      : 동적 보드(terrainFeatures)에 추가된 타일 (동적, 매 프레임)
// C키는 도구 사용(useTool)과 겹치므로 디버그에서 제거 — controls.ts #cKey 참고.
export class DebugHud {
  private coordsText: Phaser.GameObjects.Text
  private collisionGraphics: Phaser.GameObjects.Graphics
  private portalGraphics: Phaser.GameObjects.Graphics
  private dynamicGraphics: Phaser.GameObjects.Graphics
  private container: Phaser.GameObjects.Container
  private hudContainer: Phaser.GameObjects.Container
  private mapObject: MapObject
  private debugVisible = false

  constructor(
    scene: Scene,
    mapObject: MapObject,
    worldLayer?: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer | null,
    portalLayer?: Phaser.Tilemaps.ObjectLayer | null
  ) {
    this.mapObject = mapObject

    const DEBUG_DEPTH = 10000

    this.collisionGraphics = scene.add.graphics().setAlpha(0.75)
    worldLayer?.renderDebug(this.collisionGraphics, {
      tileColor: null,
      collidingTileColor: new Display.Color(243, 134, 48, 255),
      faceColor: new Display.Color(40, 39, 37, 255)
    })

    this.portalGraphics = scene.add.graphics()
    this.drawPortals(portalLayer, worldLayer)

    this.dynamicGraphics = scene.add.graphics()

    this.container = scene.add
      .container(0, 0, [this.collisionGraphics, this.portalGraphics, this.dynamicGraphics])
      .setDepth(DEBUG_DEPTH)
      .setVisible(false)
    scene.children.bringToTop(this.container)

    const infoText = scene.add.text(
      0,
      0,
      ['Arrow keys: move player', 'C: use tool (till)', 'P: toggle debug overlays'].join('\n'),
      {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 6 }
      }
    )

    this.coordsText = scene.add.text(0, infoText.height + 8, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 6 }
    })

    const hudWidth = Math.max(infoText.width, this.coordsText.width)
    const HUD_MARGIN = 8

    this.hudContainer = scene.add
      .container(scene.scale.width - hudWidth - HUD_MARGIN, HUD_MARGIN, [
        infoText,
        this.coordsText
      ])
      .setScrollFactor(0)
      .setDepth(DEBUG_DEPTH)

    scene.input.keyboard!.on('keydown-P', () => this.toggleDebug())
  }

  private toggleDebug(): void {
    this.debugVisible = !this.debugVisible
    this.container.setVisible(this.debugVisible)
  }

  private drawPortals(
    portalLayer?: Phaser.Tilemaps.ObjectLayer | null,
    worldLayer?: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer | null
  ): void {
    const tw = worldLayer?.tilemap.tileWidth ?? 0
    const th = worldLayer?.tilemap.tileHeight ?? 0
    if (!portalLayer || !tw || !th) return

    this.portalGraphics.clear()
    this.portalGraphics.fillStyle(0x00ffff, 0.35)
    this.portalGraphics.lineStyle(2, 0x00ffff, 0.9)
    portalLayer.objects.forEach((obj) => {
      if (obj.x == null || obj.y == null) return
      const col = Math.floor(obj.x / tw)
      const row = Math.floor(obj.y / th)
      this.portalGraphics.fillRect(col * tw, row * th, tw, th)
      this.portalGraphics.strokeRect(col * tw, row * th, tw, th)
    })
  }

  update(target: Phaser.GameObjects.Sprite, map: Phaser.Tilemaps.Tilemap): void {
    const tx = Math.floor(target.x / map.tileWidth)
    const ty = Math.floor(target.y / map.tileHeight)
    this.coordsText.setText(
      `x: ${Math.round(target.x)}  y: ${Math.round(target.y)}\ntile: ${tx}, ${ty}`
    )
  }
}
