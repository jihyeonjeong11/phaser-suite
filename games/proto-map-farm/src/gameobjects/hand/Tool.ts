import { Scene, Tilemaps } from 'phaser'
import { WorldPos } from '../../game/utils/constants/constants'
import { MapObject } from '../mapObjects/MapObjects'
import { dataManager } from '../../game/managers/Store'
import { playSound } from '../../game/utils/audios'
import { AUDIO_KEYS } from '../../game/utils/constants/audioKeys'
import { TEMP_ITEMS } from '../../game/utils/constants/items'
import { TEMP_CROPS } from '../../game/utils/constants/crops'

// TODO: Hand > Weapon > Tool 상속이 아니라 Equipment 인터페이스의 형제로 정리할 것.
// 지금은 스프라이트 없이 useTool 로직만 담는다. 대상 타일은 마우스 aim으로 결정.
export class Tool {
  private scene: Scene
  private worldLayer: Tilemaps.TilemapLayer
  private mapObject: MapObject
  private lastUsed = 0

  private static readonly USE_COOLDOWN = 350

  constructor(scene: Scene, worldLayer: Tilemaps.TilemapLayer, mapObject: MapObject) {
    this.scene = scene
    this.worldLayer = worldLayer
    this.mapObject = mapObject
  }

  use(aim: WorldPos, now: number): void {
    if (now < this.lastUsed + Tool.USE_COOLDOWN) return
    this.lastUsed = now

    const currentIdx = dataManager.getCurrentSelectedIdx()
    if (currentIdx === -1) return
    const currentItem = dataManager.getInventory()[currentIdx]
    if (!currentItem) return

    // 마우스 커서가 가리키는 월드좌표 → 대상 타일(col, row)
    const map = this.worldLayer.tilemap
    const tile = map.worldToTileXY(aim.x, aim.y)
    if (!tile) return
    const col = tile.x
    const row = tile.y

    // 물뿌리개는 스타듀밸리처럼 어떤 타일에서든 사용 가능 (게이팅 제외, water() 내부에서 자체 검증)
    if (currentItem.name === 'testing_watering_can') {
      playSound(this.scene, AUDIO_KEYS.WATERING)
      this.mapObject.water(col, row)
      return
    }

    if (!this.mapObject.isInteractable(col, row, currentItem)) return

    if (currentItem.type === 'seed') {
      // items.ts 키(TEMP_CROPS[key].seedItem)로 현재 든 아이템에 대응하는 작물을 찾는다.
      const cropKey = (Object.keys(TEMP_CROPS) as (keyof typeof TEMP_CROPS)[]).find(
        (key) =>
          TEMP_ITEMS[TEMP_CROPS[key].seedItem as keyof typeof TEMP_ITEMS]?.name === currentItem.name
      )
      if (cropKey) {
        this.mapObject.seed(col, row, cropKey)
        dataManager.consumeItem(currentIdx)
      }
    } else if (currentItem.name === 'testing_pickaxe') {
      playSound(this.scene, AUDIO_KEYS.PICKAXE)
      this.mapObject.swingPickaxe(col, row)
      dataManager.addItem(TEMP_ITEMS.scrap_metal)
    } else if (currentItem.name === 'testing_axe') {
      playSound(this.scene, AUDIO_KEYS.AXE)
      this.mapObject.swingAxe(col, row)
      dataManager.addItem(TEMP_ITEMS.wood)
    } else if (currentItem.name === 'testing_hoe') {
      playSound(this.scene, AUDIO_KEYS.HOE)
      this.mapObject.till(col, row)
    }
  }
}
