import { GameObjects, Math, Tilemaps } from 'phaser'
import { MAP_KEYS, MapKey } from '../../game/utils/constants/mapKeys'
import { dataManager } from '../../game/managers/Store'
import { StaticFeatures } from './Components/StaticFeatures'
import {
  ObjectMap,
  STATIC_TILE_PROPERTIES,
  TEMP_OBJECT_TILES,
  Tile
} from '../../game/utils/constants/tiles'

export class MapObject {
  private belowLayer: Tilemaps.TilemapLayer
  private worldLayer: Tilemaps.TilemapLayer
  private resourceClumps = new Set<string>()
  private mapKey: MapKey
  private drawnSprites = new Map<string, GameObjects.Image>()

  constructor(
    belowLayer: Tilemaps.TilemapLayer,
    worldLayer: Tilemaps.TilemapLayer,
    mapKey: MapKey
  ) {
    this.belowLayer = belowLayer
    this.worldLayer = worldLayer
    this.mapKey = mapKey
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

  isInteractable(col: number, row: number, tool: string): boolean {
    const feature = dataManager.getMap(this.mapKey)[this.posToString(col, row)]

    if (tool === 'testing_hoe') {
      if (feature) return false
      return this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) === true
    }

    if (!feature) return false

    switch (feature.name) {
      case 'tree':
        return tool === 'testing_axe'
      case 'sign':
        return tool === 'testing_pickaxe'
      case 'tilled_dirt':
        return tool === 'testing_watering_can'
      default:
        return false
    }
  }
}
