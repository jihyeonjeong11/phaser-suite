import { Data, Events } from 'phaser'
import { DEFAULT_MAP_KEY } from '../utils/constants/mapKeys'
import { DIRECTION, Direction } from '../utils/constants/constants'
import { ObjectMap } from '../utils/constants/tiles'
import { MapObject } from '../../gameobjects/mapObjects/MapObjects'
import { TEMP_ITEMS } from '../utils/constants/items'
import { TEMP_CROPS } from '../utils/constants/crops'

// inventory current scope
// characterdata if battle implemented money, hp, stamina...
// farm tile board(preserve farm object )
// farmable objects(plants, grass, stone, wood...)
// other tile board(if add customization & construction)
// entry point? after add all map sprites!
// global states(season, time, flags...)

// todo: save/load https://www.dynetisgames.com/2018/10/28/how-save-load-player-progress-localstorage/
// todo: need initialState

export const TEMP_INV_LIMIT = 10

// todo: schema
//        weapons 스프라이트시트는 현재 프레임 1개(frame 0). frame을 비워두면 기본 0으로 렌더됨
// type 추가 (weapon | tool | resource...) — 아직 미적용, 임시로 frame 유무로 Weapon/Tool 판별
export interface InventoryItem {
  name: string
  type: string
  textureKey: string
  frame?: number | string
  soundMap?: Record<string, string>
  maxStack?: number
  currentStack?: number
}

export interface PlayerData {
  x: number
  y: number
  currentMapKey: string
  direction: Direction
}

const initialState = {
  player: {
    x: 0,
    y: 0,
    currentMapKey: DEFAULT_MAP_KEY,
    direction: DIRECTION.DOWN
  },
  inventory: [
    TEMP_ITEMS.testing_rifle,
    TEMP_ITEMS.testing_watering_can,
    TEMP_ITEMS.testing_pickaxe,
    TEMP_ITEMS.testing_hoe,
    TEMP_ITEMS.testing_axe,
    { ...TEMP_ITEMS.seed_corn, currentStack: 1 }
  ],
  currentSelectedIdx: -1,
  interactableMaps: Object.assign({}, {} as MapObject)
  // volume 등 옵션은 세이브 상위 계층(GlobalConfig, localStorage)에서 관리한다.
} as const

// registry manager
class DataManager extends Events.EventEmitter {
  private static readonly SAVE_KEY = 'proto-map-farm-save'
  private store: Data.DataManager

  constructor() {
    super()
    this.store = new Data.DataManager(this)
    // initialize state with initial values
    this.reset()
    //this.#updateDataManger(initialState);
  }

  reset() {
    this.store.set(initialState)
  }

  save() {
    localStorage.setItem(DataManager.SAVE_KEY, JSON.stringify(this.store.getAll()))
  }

  hasSave(): boolean {
    return localStorage.getItem(DataManager.SAVE_KEY) !== null
  }

  load(): boolean {
    const raw = localStorage.getItem(DataManager.SAVE_KEY)
    if (!raw) return false
    try {
      const parsed = JSON.parse(raw)
      this.store.set(parsed)
      return true
    } catch (e) {
      console.log('[DIAG] load() FAILED', e)
      return false
    }
  }

  getCurrentSelectedIdx() {
    return this.store.get('currentSelectedIdx')
  }

  setCurrentSelectedIdx(n: number) {
    this.store.set('currentSelectedIdx', n)
  }

  getPlayerData(): PlayerData {
    return this.store.get('player')
  }

  // 부분 갱신(merge). x,y만 넘겨도 currentMapKey/direction이 보존된다.
  setPlayerData(patch: Partial<PlayerData>) {
    this.store.set('player', { ...this.store.get('player'), ...patch })
  }

  getInventory() {
    return this.store.get('inventory')
  }

  setInventory(inventory: InventoryItem[]) {
    this.store.set('inventory', inventory)
  }

  addItem(item: InventoryItem) {
    const inventory = this.store.get('inventory') as InventoryItem[]

    // 스택 가능한 아이템은 기존 칸에 여유가 있으면 currentStack만 올리고, 새 칸을 차지하지 않는다.
    if (item.maxStack !== undefined) {
      const idx = inventory.findIndex(
        (i) => i.name === item.name && (i.currentStack ?? 0) < (i.maxStack ?? Infinity)
      )
      if (idx !== -1) {
        const updated = [...inventory]
        const existing = updated[idx]
        updated[idx] = { ...existing, currentStack: (existing.currentStack ?? 0) + 1 }
        this.setInventory(updated)
        return
      }
    }

    if (inventory.length >= TEMP_INV_LIMIT) return
    const newItem = item.maxStack !== undefined ? { ...item, currentStack: 1 } : item
    this.setInventory([...inventory, newItem])
  }

  // 스택이 있으면 1개만 줄이고, 없거나 다 떨어지면 칸에서 제거한다.
  consumeItem(index: number) {
    const inventory = this.store.get('inventory') as InventoryItem[]
    const item = inventory[index]
    if (!item) return

    if (item.currentStack !== undefined && item.currentStack > 1) {
      const updated = [...inventory]
      updated[index] = { ...item, currentStack: item.currentStack - 1 }
      this.setInventory(updated)
      return
    }

    this.setInventory(inventory.filter((_, i) => i !== index))
  }

  // 해당 맵의 delta 보드를 반환(없으면 빈 객체). MapObject가 진입 시 로드에 사용.
  getMap(mapKey: string): ObjectMap {
    const maps = this.store.get('interactableMaps')

    return maps?.[mapKey] ?? {}
  }

  setMap(mapKey: string, delta: ObjectMap) {
    const maps = {
      ...this.store.get('interactableMaps'),
      [mapKey]: delta
    }
    this.store.set('interactableMaps', maps)
  }

  // 하루 경과: 현재 보고 있는 맵뿐 아니라 저장된 모든 맵의 watered crop을 성장시킨다.
  // (예: Farm에서 심고 Home에서 잠들어도 Farm의 작물이 자라야 한다.)
  advanceAllMaps(): void {
    const allMaps = this.store.get('interactableMaps') as Record<string, ObjectMap>
    let changed = false
    const nextMaps: Record<string, ObjectMap> = { ...allMaps }

    for (const [mapKey, board] of Object.entries(allMaps)) {
      const next: ObjectMap = { ...board }
      let mapChanged = false

      for (const [pos, feature] of Object.entries(board)) {
        if (feature.name !== 'tilled_dirt' || !feature.cropKey || !feature.watered) continue

        const crop = TEMP_CROPS[feature.cropKey]
        const stageIdx = feature.growthStage ?? 0
        const stage = crop.stages[stageIdx]
        if (!stage) continue

        const daysInStage = (feature.daysInStage ?? 0) + 1
        const isMature = stageIdx >= crop.stages.length - 1

        next[pos] = isMature
          ? { ...feature, watered: false }
          : daysInStage >= stage.days
            ? { ...feature, growthStage: stageIdx + 1, daysInStage: 0, watered: false }
            : { ...feature, daysInStage, watered: false }
        mapChanged = true
      }

      if (mapChanged) {
        nextMaps[mapKey] = next
        changed = true
      }
    }

    if (changed) this.store.set('interactableMaps', nextMaps)
  }
}

export const dataManager = new DataManager()
