import { GameObjects, Math, Physics, Tilemaps } from 'phaser'
import { MAP_KEYS, MapKey } from '../../game/utils/constants/mapKeys'
import { dataManager } from '../../game/managers/Store'
import type { InventoryItem } from '../../game/managers/Store'
import { StaticFeatures } from './Components/StaticFeatures'
import {
  ObjectMap,
  STATIC_TILE_PROPERTIES,
  TEMP_OBJECT_TILES,
  Tile
} from '../../game/utils/constants/tiles'
import { CropKey, TEMP_CROPS } from '../../game/utils/constants/crops'

export class MapObject {
  private belowLayer: Tilemaps.TilemapLayer
  private worldLayer: Tilemaps.TilemapLayer
  private resourceClumps = new Set<string>()
  private mapKey: MapKey
  private drawnSprites = new Map<string, GameObjects.Image>()
  private cropSprites = new Map<string, GameObjects.Image>()
  // isPassable=false인 feature(나무/표지판)의 물리 충돌 바디. 적 collider가 이걸 참조한다.
  private blockingGroup: Physics.Arcade.StaticGroup

  constructor(
    belowLayer: Tilemaps.TilemapLayer,
    worldLayer: Tilemaps.TilemapLayer,
    mapKey: MapKey
  ) {
    this.belowLayer = belowLayer
    this.worldLayer = worldLayer
    this.mapKey = mapKey
    this.blockingGroup = worldLayer.scene.physics.add.staticGroup()
    if (mapKey === MAP_KEYS.CLIFF) {
      new StaticFeatures(mapKey, worldLayer)
      if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
        const initialMap: ObjectMap = Object.assign({}, {} as ObjectMap)
        let treeNumber = 0
        this.belowLayer.forEachTile((t) => {
          if (
            !this.worldLayer.getTileAt(t.x, t.y) &&
            t.properties.Diggable &&
            !this.isTileOccupied(t.x, t.y)
          ) {
            const roll = Math.FloatBetween(0, 1)
            if (roll > 0.98 && treeNumber < 10) {
              initialMap[this.posToString(t.x, t.y)] = TEMP_OBJECT_TILES.tree
              treeNumber++
            } else if (roll > 0.7) {
              initialMap[this.posToString(t.x, t.y)] = TEMP_OBJECT_TILES.grass
            }
          }
        })
        dataManager.setMap(mapKey, initialMap)
      }
    } else if (mapKey === MAP_KEYS.RUIN) {
      if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
        const initialMap: Record<string, Tile> = {}
        this.belowLayer.forEachTile((t) => {
          if (!this.isTileOccupied(t.x, t.y) && Math.FloatBetween(0, 1) > 0.99) {
            initialMap[this.posToString(t.x, t.y)] = TEMP_OBJECT_TILES.sign
          }
        })
        dataManager.setMap(mapKey, initialMap)
      }
    }

    this.draw()
    dataManager.on('changedata-interactableMaps', this.draw, this)
    this.worldLayer.once(GameObjects.Events.DESTROY, this.destroy, this)
  }

  destroy(): void {
    dataManager.off('changedata-interactableMaps', this.draw, this)
    for (const img of this.drawnSprites.values()) img.destroy()
    this.drawnSprites.clear()
    for (const img of this.cropSprites.values()) img.destroy()
    this.cropSprites.clear()
  }

  draw() {
    Object.entries(dataManager.getMap(this.mapKey)).forEach(([posString, k]) => {
      const [col, row] = this.stringToPos(posString)
      switch (k.name) {
        case 'grass':
          this.drawGrass(col, row, k)
          break
        case 'tree':
          this.drawTree(col, row, k)
          break
        case 'sign':
          this.drawSign(col, row, k)
          break
        case 'tilled_dirt':
          this.drawTilled(col, row, k)
          break
      }
    })

    const board = dataManager.getMap(this.mapKey)
    for (const [key, img] of this.drawnSprites) {
      if (board[key] === undefined) {
        img.destroy()
        this.drawnSprites.delete(key)
      }
    }
    for (const [key, img] of this.cropSprites) {
      const feature = board[key]
      if (!feature || !('cropKey' in feature) || !feature.cropKey) {
        img.destroy()
        this.cropSprites.delete(key)
      }
    }

    this.rebuildBlocking()
  }

  getBlockingGroup(): Physics.Arcade.StaticGroup {
    return this.blockingGroup
  }

  // isPassable=false인 feature마다 타일 크기 static 바디를 만든다(draw마다 재구성).
  private rebuildBlocking(): void {
    this.blockingGroup.clear(true, true)
    const scene = this.worldLayer.scene
    const tw = this.worldLayer.tilemap.tileWidth
    const th = this.worldLayer.tilemap.tileHeight
    Object.entries(dataManager.getMap(this.mapKey)).forEach(([posString, k]) => {
      if (k.isPassable) return
      const [col, row] = this.stringToPos(posString)
      const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + tw / 2
      const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + th / 2
      const zone = scene.add.zone(wx, wy, tw, th)
      this.blockingGroup.add(zone) // static 바디 자동 부여
    })
  }

  removeFeature(col: number, row: number): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    const rest = { ...board }
    delete rest[pos]
    dataManager.setMap(this.mapKey, rest)
  }

  addFeature(col: number, row: number, feature: Tile): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    dataManager.setMap(this.mapKey, { ...board, [pos]: feature })
  }

  private drawGrass(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    if (this.drawnSprites.has(key)) return

    const scene = this.worldLayer.scene
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 16
    const img = scene.add.image(wx, wy, k.texture, k.frame).setDepth(1)
    this.drawnSprites.set(key, img)
  }

  private drawTree(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    if (this.drawnSprites.has(key)) return

    const scene = this.worldLayer.scene
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 32
    //todo: texture placing failed
    const img = scene.add.image(wx, wy, k.texture, k.frame).setOrigin(0.5, 1).setDepth(1)
    this.drawnSprites.set(key, img)
  }

  private drawSign(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    if (this.drawnSprites.has(key)) return

    const scene = this.worldLayer.scene
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 32
    const img = scene.add.image(wx, wy, k.texture, k.frame).setOrigin(0.5, 1).setDepth(1)
    this.drawnSprites.set(key, img)
  }

  private drawTilled(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    let img = this.drawnSprites.get(key)
    if (!img) {
      const scene = this.belowLayer.scene
      const wx = (this.belowLayer.tileToWorldX(col) ?? 0) + 16
      const wy = (this.belowLayer.tileToWorldY(row) ?? 0) + 32
      img = scene.add.image(wx, wy, k.texture, k.frame).setOrigin(0.5, 1).setDepth(1)
      this.drawnSprites.set(key, img)
    }

    if (k.name === 'tilled_dirt' && k.watered) {
      img.setTint(0x6f8fb0)
    } else {
      img.clearTint()
    }

    this.drawCrop(col, row, k)
  }

  private drawCrop(col: number, row: number, k: Tile): void {
    if (!('cropKey' in k) || !k.cropKey) return

    const crop = TEMP_CROPS[k.cropKey]
    const stageIdx = 'growthStage' in k ? (k.growthStage ?? 0) : 0
    const stage = crop.stages[stageIdx] ?? crop.stages[crop.stages.length - 1]
    console.log(crop, stage)
    const key = this.posToString(col, row)
    let img = this.cropSprites.get(key)
    if (!img) {
      const wx = (this.belowLayer.tileToWorldX(col) ?? 0) + 16
      const wy = (this.belowLayer.tileToWorldY(row) ?? 0) + 32
      img = this.belowLayer.scene.add
        .image(wx, wy, crop.textureKey, stage.frame)
        .setOrigin(0.5, 1)
        .setDepth(1)
      this.cropSprites.set(key, img)
    } else {
      img.setFrame(stage.frame)
    }
  }

  private posToString(col: number, row: number): string {
    return `${col},${row}`
  }

  private stringToPos(s: string): [number, number] {
    const [col, row] = s.split(',').map(Number)
    return [col, row]
  }

  swingAxe(col: number, row: number) {
    //board -> tree -> remove -> setMap
    this.removeFeature(col, row)
  }
  swingPickaxe(col: number, row: number) {
    this.removeFeature(col, row)
  }

  water(col: number, row: number): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    const feature = board[pos]
    if (feature?.name !== 'tilled_dirt' || feature.watered) return
    const watered: Tile = { ...feature, watered: true }
    dataManager.setMap(this.mapKey, { ...board, [pos]: watered })
  }

  till(col: number, row: number): void {
    this.addFeature(col, row, TEMP_OBJECT_TILES.tilled)
  }

  seed(col: number, row: number, cropKey: CropKey): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    const feature = board[pos]
    if (!feature || feature.name !== 'tilled_dirt' || feature.cropKey) return

    const planted: Tile = { ...feature, cropKey, growthStage: 0, daysInStage: 0 }
    dataManager.setMap(this.mapKey, { ...board, [pos]: planted })
  }

  // 다 자란 작물만 수확한다. 성공 시 심어져 있던 cropKey를 반환, 아니면 null.
  // (regrowDays 미지원: 수확하면 tilled_dirt까지 통째로 제거된다. 다시 심으려면 갈아야 함)
  harvest(col: number, row: number): CropKey | null {
    const board = dataManager.getMap(this.mapKey)
    const feature = board[this.posToString(col, row)]
    if (!feature || feature.name !== 'tilled_dirt' || !feature.cropKey) return null

    const crop = TEMP_CROPS[feature.cropKey]
    const stageIdx = feature.growthStage ?? 0
    if (stageIdx < crop.stages.length - 1) return null

    const cropKey = feature.cropKey
    this.removeFeature(col, row)
    return cropKey
  }

  private doesTileHaveProperty(col: number, row: number, prop: string): unknown {
    return this.belowLayer.getTileAt(col, row)?.properties?.[prop]
  }

  isTileOccupied(col: number, row: number): boolean {
    const key = this.posToString(col, row)
    const features = dataManager.getMap(this.mapKey)[key]
    return features?.isOccupied
  }

  isTilePassable(col: number, row: number): boolean {
    const key = this.posToString(col, row)
    if (this.resourceClumps.has(key)) return true
    if (this.worldLayer.getTileAt(col, row) != null) return true
    const features = dataManager.getMap(this.mapKey)[key]
    return !features?.isOccupied || features?.isPassable
  }

  getTileInfo(col: number, row: number) {
    const diggable = this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) === true
    const watersource =
      this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.WATERSOURCE) === true
    const action = this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.ACTION)
    const features = dataManager.getMap(this.mapKey)[this.posToString(col, row)] ?? null
    return { diggable, features, watersource, action }
  }

  isInteractable(col: number, row: number, tool: InventoryItem): boolean {
    const feature = dataManager.getMap(this.mapKey)[this.posToString(col, row)]

    // 씨앗은 아직 작물이 없는 tilled_dirt 위에서만 사용 가능
    if (tool.type === 'seed') {
      return feature?.name === 'tilled_dirt' && !feature.cropKey
    }

    if (tool.name === 'testing_hoe') {
      if (feature) return false
      return this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) === true
    }

    if (!feature) return false

    switch (feature.name) {
      case 'tree':
        return tool.name === 'testing_axe'
      case 'sign':
        return tool.name === 'testing_pickaxe'
      case 'tilled_dirt':
        return tool.name === 'testing_watering_can'
      default:
        return false
    }
  }
}
