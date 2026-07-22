import { Physics, Scene, Tilemaps, Types } from 'phaser'
import { MapObject } from './mapObjects/MapObjects'
import { MapKey } from '../game/utils/constants/mapKeys'
import { WorldPos } from '../game/utils/constants/constants'
import { STATIC_TILE_PROPERTIES } from '../game/utils/constants/tiles'

function imageKeyFor(source: string): string {
  const base = source.split(/[\\/]/).pop() ?? source
  return base.replace(/\.[^.]+$/, '')
}
export class Worldmap {
  readonly map: Tilemaps.Tilemap
  // todo: need intractable tile for farming
  // Optional: only some maps have it. Drawn behind everything, used as a
  // collision source for void areas outside the walkable ground.
  readonly backgroundLayer: Tilemaps.TilemapLayer | null
  readonly belowLayer: Tilemaps.TilemapLayer
  readonly worldLayer: Tilemaps.TilemapLayer
  readonly aboveLayer: Tilemaps.TilemapLayer

  readonly spawnPoint: Types.Tilemaps.TiledObject
  readonly portalLayer: Tilemaps.ObjectLayer | null

  mapObjects: MapObject

  constructor(scene: Scene, key: MapKey) {
    this.map = scene.make.tilemap({ key })

    const tilesets = this.resolveTilesets(scene, key)

    // Created first + depth -10 so it renders behind Below/World/Above.
    // (Phaser depth follows creation order; Tiled's layer order is not read.)
    this.backgroundLayer = this.map.getLayer('Background')
      ? (this.map.createLayer('Background', tilesets, 0, 0, false) as Tilemaps.TilemapLayer)
      : null
    this.backgroundLayer?.setDepth(-10)

    this.belowLayer = this.map.createLayer(
      'Below Player',
      tilesets,
      0,
      0,
      false
    ) as Tilemaps.TilemapLayer
    this.belowLayer.setDepth(0)
    this.worldLayer = this.map.createLayer('World', tilesets, 0, 0, false) as Tilemaps.TilemapLayer
    this.aboveLayer = this.map.createLayer(
      'Above Player',
      tilesets,
      0,
      0,
      false
    ) as Tilemaps.TilemapLayer

    // consider: should i need different spawn points? maybe
    this.spawnPoint = this.map.findObject(
      'Objects',
      (obj) => obj.name === 'Spawn Point'
    ) as Phaser.Types.Tilemaps.TiledObject

    if (!this.spawnPoint) {
      throw new Error('Worldmap should have at least one spawn point.')
    }

    this.portalLayer = this.map.getObjectLayer('Portals')

    this.mapObjects = new MapObject(this.belowLayer, this.getWorldLayer(), key as MapKey)

    this.addMapCollision(scene)
  }

  getSpawnPoint(): Types.Tilemaps.TiledObject {
    return this.spawnPoint
  }

  getMap(): Tilemaps.Tilemap {
    return this.map
  }

  getWorldLayer() {
    return this.worldLayer
  }

  getBackgroundLayer() {
    return this.backgroundLayer
  }

  getPortalLayer() {
    return this.portalLayer
  }

  // "이 픽셀 위치를 지나갈 수 있나?" — 걷기 이동의 통과 규칙(경계/장애물/물/오브젝트)을 한곳에 모은다.
  isPassable(pos: WorldPos): boolean {
    if (!this.isWithinBounds(pos)) return false
    if (this.collidesObstacle(pos)) return false

    const tile = this.map.worldToTileXY(pos.x, pos.y)
    if (!tile) return false
    if (this.mapObjects.getTileInfo(tile.x, tile.y).watersource) return false
    if (!this.mapObjects.isTilePassable(tile.x, tile.y)) return false

    return true
  }

  private isWithinBounds(pos: WorldPos): boolean {
    return (
      pos.x >= 0 &&
      pos.y >= 0 &&
      pos.x <= this.map.widthInPixels &&
      pos.y <= this.map.heightInPixels
    )
  }

  private collidesObstacle(pos: WorldPos): boolean {
    return this.collidesLayer(this.worldLayer, pos) || this.collidesLayer(this.backgroundLayer, pos)
  }

  private collidesLayer(layer: Tilemaps.TilemapLayer | null, pos: WorldPos): boolean {
    if (!layer) return false
    const tile = layer.getTileAtWorldXY(pos.x, pos.y, true)
    return tile != null && tile.index !== -1
  }

  private addMapCollision(scene: Scene) {
    this.worldLayer?.setCollisionByExclusion([-1])
    this.backgroundLayer?.setCollisionByExclusion([-1])
    // 물 타일(belowLayer의 watersource 속성)만 충돌 켜기 — 나머지 바닥은 통과 가능.
    this.belowLayer.setCollisionByProperty({ [STATIC_TILE_PROPERTIES.WATERSOURCE]: true })

    scene.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
  }

  // 적 그룹이 벽/공백/물/맵오브젝트를 물리로 회피하도록 collider를 한 번에 건다.
  addEnemyColliders(enemyGroup: Physics.Arcade.Group): void {
    const physics = this.worldLayer.scene.physics
    physics.add.collider(enemyGroup, this.worldLayer) // 벽/장애물
    if (this.backgroundLayer) physics.add.collider(enemyGroup, this.backgroundLayer) // 공백
    physics.add.collider(enemyGroup, this.belowLayer) // 물(충돌 켜진 타일만)
    physics.add.collider(enemyGroup, this.mapObjects.getBlockingGroup()) // 나무/표지판
  }

  // todo: need to draw real tileset
  private resolveTilesets(scene: Scene, key: string): Phaser.Tilemaps.Tileset[] {
    const raw =
      (scene.cache.tilemap.get(key)?.data?.tilesets as
        { name: string; image?: string }[] | undefined) ?? []
    return raw
      .map((t) => {
        const imgKey = t.image ? imageKeyFor(t.image) : undefined
        return imgKey ? this.map.addTilesetImage(t.name, imgKey) : null
      })
      .filter((ts): ts is Phaser.Tilemaps.Tileset => ts !== null)
  }
}
