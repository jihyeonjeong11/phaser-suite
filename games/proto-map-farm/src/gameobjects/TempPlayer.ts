import { GameObjects, Scene, Tilemaps, Types } from 'phaser'
import { Controls } from '../game/utils/controls'
import { dataManager } from '../game/managers/Store'
import { MapObject } from './mapObjects/MapObjects'
import { playSound } from '../game/utils/audios'
import { AUDIO_KEYS } from '../game/utils/constants/audioKeys'
import { DIRECTION, TilePos, WorldPos } from '../game/utils/constants/constants'
import { TEMP_ITEMS } from '../game/utils/constants/items'
import { TEMP_CROPS } from '../game/utils/constants/crops'
import { STATIC_TILE_PROPERTIES } from '../game/utils/constants/tiles'

class TargetTile {
  private targetHighlight: GameObjects.Rectangle
  private targetPos: TilePos = { col: 0, row: 0 }
  private map: Tilemaps.Tilemap

  constructor(scene: Scene, map: Tilemaps.Tilemap) {
    this.map = map
    this.targetHighlight = scene.add
      .rectangle(0, 0, map.tileWidth, map.tileHeight, 0x00ff00, 0.25)
      .setStrokeStyle(2, 0x00ff00, 0.9)
      .setDepth(5)
  }

  setTarget(col: number, row: number): void {
    this.targetPos = { col, row }
    const world = this.map.tileToWorldXY(col, row)
    if (!world) return
    this.targetHighlight.setPosition(
      world.x + this.map.tileWidth / 2,
      world.y + this.map.tileHeight / 2
    )
  }

  getPos(): TilePos {
    return this.targetPos
  }
}

export class TempPlayer {
  charSprite: GameObjects.Sprite
  scene: Scene
  _controls: Controls
  _worldLayer: Tilemaps.TilemapLayer
  _backgroundLayer: Tilemaps.TilemapLayer | null
  _portalLayer: Tilemaps.ObjectLayer | null
  private onEnterPortal: (dest: string) => void
  private mapObject: MapObject
  private targetTile: TargetTile
  protected readonly baseScale: number = 3
  // todo: compute actual speed for Player class
  protected readonly baseSpeed: number = 3
  constructor(
    scene: Scene,
    startPos: WorldPos,
    _controls: Controls,
    collisionLayer: Tilemaps.TilemapLayer,
    backgroundLayer: Tilemaps.TilemapLayer | null,
    portalLayer: Tilemaps.ObjectLayer | null,
    onEnterPortal: (dest: string) => void,
    mapObject: MapObject
  ) {
    this.scene = scene
    this._controls = _controls
    this._worldLayer = collisionLayer
    this.targetTile = new TargetTile(scene, this._worldLayer.tilemap)
    this._backgroundLayer = backgroundLayer
    this._portalLayer = portalLayer
    this.onEnterPortal = onEnterPortal
    this.mapObject = mapObject
    dataManager.setPlayerData({ x: startPos.x, y: startPos.y })
    this.charSprite = scene.add.sprite(startPos.x, startPos.y, 'base_char', 0).setDepth(2)

    // setscale
    this.charSprite.setScale(this.baseScale)
    const key = this.charSprite.texture.key
    this.charSprite.anims.create({
      key: `${key}-idle`,
      frames: this.charSprite.anims.generateFrameNumbers(key, {
        frames: [0, 1]
      }),
      frameRate: 3,
      repeat: -1
    })

    this.charSprite.anims.create({
      key: `${key}-walk`,
      frames: this.charSprite.anims.generateFrameNumbers(key, {
        frames: [2, 3]
      }),
      frameRate: 3,
      repeat: -1
    })

    this.charSprite.play(`${key}-idle`)

    // 이동
    // 포탈 이동
    // hand
    // 무기
    // 총알
    // 툴
  }

  private doesPositionCollideWithWorldLayer(position: WorldPos): boolean {
    if (!this._worldLayer) {
      return false
    }

    const { x, y } = position
    const tile = this._worldLayer.getTileAtWorldXY(x, y, true)
    if (!tile) {
      return false
    }
    return tile.index !== -1
  }

  private doesPositionCollideWithBackgroundLayer(position: WorldPos): boolean {
    if (!this._backgroundLayer) {
      return false
    }

    const { x, y } = position
    const tile = this._backgroundLayer.getTileAtWorldXY(x, y, true)
    if (!tile) {
      return false
    }
    return tile.index !== -1
  }

  private isWithinBounds(position: WorldPos): boolean {
    const map = this._worldLayer.tilemap
    const { x, y } = position
    return x >= 0 && y >= 0 && x <= map.widthInPixels && y <= map.heightInPixels
  }

  private getPortalAt(position: WorldPos): Types.Tilemaps.TiledObject | null {
    if (!this._portalLayer) return null
    const map = this._worldLayer.tilemap
    const tw = map.tileWidth
    const th = map.tileHeight
    const col = Math.floor(position.x / tw)
    const row = Math.floor(position.y / th)
    return (
      this._portalLayer.objects.find((obj) => {
        if (obj.x == null || obj.y == null) return false
        return Math.floor(obj.x / tw) === col && Math.floor(obj.y / th) === row
      }) ?? null
    )
  }

  private updateTargetTile(): void {
    const { direction } = dataManager.getPlayerData()
    const dx = direction === 'LEFT' ? -1 : direction === 'RIGHT' ? 1 : 0
    const dy = direction === 'UP' ? -1 : direction === 'DOWN' ? 1 : 0

    // 발밑 타일 → 바라보는 앞 칸. 픽셀 변환·이동·pos 저장은 TargetTile이 담당.
    const { col, row } = this.playerPixelToPOS()
    this.targetTile.setTarget(col + dx, row + dy)
  }

  private useTool(): void {
    const currentIdx = dataManager.getCurrentSelectedIdx()
    if (currentIdx === -1) return
    // todo: need 핸드 클래스?
    const currentHand = dataManager.getInventory()[currentIdx]
    const map = this._worldLayer.tilemap
    const tw = map.tileWidth
    const th = map.tileHeight

    const { x, y, direction } = dataManager.getPlayerData()
    const dx = direction === 'LEFT' ? -1 : direction === 'RIGHT' ? 1 : 0
    const dy = direction === 'UP' ? -1 : direction === 'DOWN' ? 1 : 0
    const col = Math.floor(x / tw) + dx
    const row = Math.floor(y / th) + dy

    // 물뿌리개는 스타듀밸리처럼 어떤 타일에서든 사용 가능 (게이팅 제외, water() 내부에서 자체 검증)
    if (currentHand.name === 'testing_watering_can') {
      playSound(this.scene, AUDIO_KEYS.WATERING)
      this.mapObject.water(col, row)
      return
    }

    if (!this.mapObject.isInteractable(col, row, currentHand)) return

    if (currentHand.type === 'seed') {
      // items.ts 키(TEMP_CROPS[key].seedItem)로 현재 든 아이템에 대응하는 작물을 찾는다.
      const cropKey = (Object.keys(TEMP_CROPS) as (keyof typeof TEMP_CROPS)[]).find(
        (key) =>
          TEMP_ITEMS[TEMP_CROPS[key].seedItem as keyof typeof TEMP_ITEMS]?.name === currentHand.name
      )
      if (cropKey) {
        this.mapObject.seed(col, row, cropKey)
        dataManager.consumeItem(currentIdx)
      }
    } else if (currentHand.name === 'testing_pickaxe') {
      playSound(this.scene, AUDIO_KEYS.PICKAXE)
      this.mapObject.swingPickaxe(col, row)
      dataManager.addItem(TEMP_ITEMS.scrap_metal)
    } else if (currentHand.name === 'testing_axe') {
      playSound(this.scene, AUDIO_KEYS.AXE)
      this.mapObject.swingAxe(col, row)
      dataManager.addItem(TEMP_ITEMS.wood)
    } else if (currentHand.name === 'testing_hoe') {
      playSound(this.scene, AUDIO_KEYS.HOE)
      this.mapObject.till(col, row)
    }
  }

  private interact() {
    const { col, row } = this.targetTile.getPos()
    const action = this._worldLayer.getTileAt(col, row)?.properties?.[STATIC_TILE_PROPERTIES.ACTION]
    if (action === 'sleep') {
      const cam = this.scene.cameras.main
      this._controls.lockInput = true
      cam.fadeOut(500, 0, 0, 0)
      cam.once('camerafadeoutcomplete', () => {
        // temp daypassing
        dataManager.advanceAllMaps()
        cam.fadeIn(500, 0, 0, 0)
        this._controls.lockInput = false
      })
      return
    }

    const cropKey = this.mapObject.harvest(col, row)
    if (cropKey) {
      const harvestKey = TEMP_CROPS[cropKey].harvestItem as keyof typeof TEMP_ITEMS
      dataManager.addItem(TEMP_ITEMS[harvestKey])
    }
  }

  private playerPixelToPOS(): TilePos {
    const { x, y } = dataManager.getPlayerData()
    const pos = this._worldLayer.tilemap.worldToTileXY(x, y)
    if (!pos) throw new Error('location calculation failed')
    return { col: pos.x, row: pos.y }
  }

  update() {
    if (this._controls.isInputLocked) return

    const key = this.charSprite.texture.key
    const dir = this._controls.getDirectionKeyPressedDown()

    let dx = 0
    let dy = 0

    switch (dir) {
      case DIRECTION.LEFT: {
        this.charSprite.setFlipX(true)
        dx = -1
        dy = 0
        break
      }
      case DIRECTION.UPLEFT: {
        this.charSprite.setFlipX(true)

        dx = -1
        dy = -1
        break
      }

      case DIRECTION.DOWNLEFT: {
        this.charSprite.setFlipX(true)

        dx = -1
        dy = 1
        break
      }
      case DIRECTION.RIGHT: {
        this.charSprite.setFlipX(false)
        dx = 1
        dy = 0
        break
      }
      case DIRECTION.UPRIGHT: {
        this.charSprite.setFlipX(false)
        dx = 1
        dy = -1
        break
      }
      case DIRECTION.DOWNRIGHT: {
        this.charSprite.setFlipX(false)
        dx = 1
        dy = 1
        break
      }
      case DIRECTION.UP: {
        dy = -1
        break
      }
      case DIRECTION.DOWN: {
        dy = 1
        break
      }
      case DIRECTION.NONE: {
        break
      }
    }

    if (dir !== 'NONE') {
      dataManager.setPlayerData({ direction: dir })
    }

    const moving = dx !== 0 || dy !== 0
    if (moving) {
      const targetPos = {
        x: this.charSprite.x + dx * this.baseSpeed,
        y: this.charSprite.y + dy * this.baseSpeed
      }

      const map = this._worldLayer.tilemap
      const targetCol = Math.floor(targetPos.x / map.tileWidth)
      const targetRow = Math.floor(targetPos.y / map.tileHeight)

      if (
        !this.doesPositionCollideWithWorldLayer(targetPos) &&
        !this.doesPositionCollideWithBackgroundLayer(targetPos) &&
        this.isWithinBounds(targetPos) &&
        !this.mapObject.getTileInfo(targetCol, targetRow).watersource &&
        this.mapObject.isTilePassable(targetCol, targetRow)
      ) {
        this.charSprite.setPosition(targetPos.x, targetPos.y)
        dataManager.setPlayerData({ x: targetPos.x, y: targetPos.y })
        playSound(this.scene, AUDIO_KEYS.FOOTSTEP)

        const portal = this.getPortalAt(targetPos)
        if (portal) {
          const dest = portal.properties?.find(
            (p: { name: string; value: unknown }) => p.name === 'dest'
          )?.value
          if (typeof dest === 'string') this.onEnterPortal(dest)
        }
      }
    }

    this.updateTargetTile()
    if (this._controls.wasCKeyPressed()) this.useTool()
    if (this._controls.wasEKeyPressed()) this.interact()
    this.charSprite.play(`${key}-${moving ? 'walk' : 'idle'}`, true)
  }
}
