import { Data, Events } from 'phaser'
import { DEFAULT_MAP_KEY } from '../utils/constants/mapKeys'
import { DIRECTION, Direction } from '../utils/constants/constants'
import { ObjectMap } from '../utils/constants/tiles'
import { MapObject } from '../../gameobjects/mapObjects/MapObjects'

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
  textureKey: string
  frame?: number
  soundMap?: Record<string, string>
}

export interface PlayerData {
  x: number
  y: number
  currentMapKey: string
  direction: Direction
}

export const TEMP_INV: InventoryItem[] = [
  {
    name: 'testing_rifle',
    textureKey: 'weapons', // 스프라이트시트 "weapons"의 frame 0 (Preloader: load.spritesheet)
    frame: undefined, // undefined = Weapon으로 판별 + 기본 frame 0 렌더
    soundMap: {
      //fire, reload
    }
  },
  {
    name: 'testing_watering_can',
    textureKey: 'tools', // spritesheet "tools"
    frame: 0,
    soundMap: {
      //pour, refill
    }
  },
  {
    name: 'testing_pickaxe',
    textureKey: 'tools',
    frame: 1,
    soundMap: {
      //mine
    }
  },
  {
    name: 'testing_hoe',
    textureKey: 'tools',
    frame: 2,
    soundMap: {
      //till
    }
  },
  {
    name: 'testing_axe',
    textureKey: 'tools',
    frame: 2,
    soundMap: {
      //chop
    }
  }
]

const initialState = {
  player: {
    x: 0,
    y: 0,
    currentMapKey: DEFAULT_MAP_KEY,
    direction: DIRECTION.DOWN
  },
  inventory: TEMP_INV,
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
}

export const dataManager = new DataManager()
