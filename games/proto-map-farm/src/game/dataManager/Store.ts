import { Data, Events } from "phaser";
import { DEFAULT_MAP_KEY } from "../utils/constants/mapKeys";
import { DIRECTION, Direction } from "../utils/constants";

// inventory current scope
// characterdata if battle implemented money, hp, stamina...
// farm tile board(preserve farm object )
// farmable objects(plants, grass, stone, wood...)
// other tile board(if add customization & construction)
// entry point? after add all map sprites!
// global states(season, time, flags...)

// todo: save/load https://www.dynetisgames.com/2018/10/28/how-save-load-player-progress-localstorage/
// todo: need initialState

export const TEMP_INV_LIMIT = 10;

// todo: schema
//        weapons 스프라이트시트는 현재 프레임 1개(frame 0). frame을 비워두면 기본 0으로 렌더됨
// type 추가 (weapon | tool | resource...) — 아직 미적용, 임시로 frame 유무로 Weapon/Tool 판별
export interface InventoryItem {
  name: string;
  textureKey: string;
  frame?: number;
  soundMap?: Record<string, string>;
}

export interface PlayerData {
  x: number;
  y: number;
  currentMapKey: string;
  direction: Direction;
}

// 갈린 흙 한 칸의 동적 상태(직렬화 대상). SDV TerrainFeatures/HoeDirt.cs 필드명.
export interface HoeDirt {
  state: number; // 0 = dry, 1 = watered
  fertilizer: number; // 0 = none
  crop: number | null; // 심긴 씨앗 index. null = 빈 흙
}

// 한 맵의 delta 보드: "col,row" → HoeDirt. (SDV GameLocation.terrainFeatures 딕셔너리의 직렬화 형태)
export type MapDelta = Record<string, HoeDirt>;

export const TEMP_INV: InventoryItem[] = [
  {
    name: "testing_rifle",
    textureKey: "weapons", // 스프라이트시트 "weapons"의 frame 0 (Preloader: load.spritesheet)
    frame: undefined, // undefined = Weapon으로 판별 + 기본 frame 0 렌더
    soundMap: {
      //fire, reload
    },
  },
  {
    name: "testing_watering_can",
    textureKey: "tools", // spritesheet "tools"
    frame: 0,
    soundMap: {
      //pour, refill
    },
  },
  {
    name: "testing_pickaxe",
    textureKey: "tools",
    frame: 1,
    soundMap: {
      //mine
    },
  },
  {
    name: "testing_axe",
    textureKey: "tools",
    frame: 2,
    soundMap: {
      //chop
    },
  },
  {
    name: "testing_hoe",
    textureKey: "tools",
    frame: 3,
    soundMap: {
      //till
    },
  },
];

const initialState = {
  player: {
    x: 0,
    y: 0,
    currentMapKey: DEFAULT_MAP_KEY,
    direction: DIRECTION.DOWN,
  },
  inventory: TEMP_INV,
  currentSelectedIdx: -1,
  // 맵별 delta 보드(변형된 칸만 희소 저장). mapKey → ("col,row" → HoeDirt)
  maps: {} as Record<string, MapDelta>,
  // volume 등 옵션은 세이브 상위 계층(GlobalConfig, localStorage)에서 관리한다.
} as const;

// registry manager
class DataManager extends Events.EventEmitter {
  private static readonly SAVE_KEY = "proto-map-farm-save";
  private store: Data.DataManager;

  constructor() {
    super();
    this.store = new Data.DataManager(this);
    // initialize state with initial values
    this.reset();
    //this.#updateDataManger(initialState);
  }

  reset() {
    this.store.set(initialState);
  }

  save() {
    localStorage.setItem(
      DataManager.SAVE_KEY,
      JSON.stringify(this.store.getAll()),
    );
  }

  hasSave(): boolean {
    return localStorage.getItem(DataManager.SAVE_KEY) !== null;
  }

  load(): boolean {
    const raw = localStorage.getItem(DataManager.SAVE_KEY);
    if (!raw) return false;
    try {
      const parsed = JSON.parse(raw);
      this.store.set(parsed);
      return true;
    } catch (e) {
      console.log("[DIAG] load() FAILED", e);
      return false;
    }
  }

  getCurrentSelectedIdx() {
    return this.store.get("currentSelectedIdx");
  }

  setCurrentSelectedIdx(n: number) {
    this.store.set("currentSelectedIdx", n);
  }

  getPlayerData(): PlayerData {
    return this.store.get("player");
  }

  // 부분 갱신(merge). x,y만 넘겨도 currentMapKey/direction이 보존된다.
  setPlayerData(patch: Partial<PlayerData>) {
    this.store.set("player", { ...this.store.get("player"), ...patch });
  }

  getInventory() {
    return this.store.get("inventory");
  }

  setInventory(inventory: InventoryItem[]) {
    this.store.set("inventory", inventory);
  }

  // 해당 맵의 delta 보드를 반환(없으면 빈 객체). MapObject가 진입 시 로드에 사용.
  getMapDelta(mapKey: string): MapDelta {
    const maps = this.store.get("maps") as Record<string, MapDelta> | undefined;
    console.log("[DIAG] 3. getMapDelta(", mapKey, ") store.get(maps) =", maps);
    return maps?.[mapKey] ?? {};
  }

  // 해당 맵의 delta 보드를 갱신. save() 시 localStorage에 함께 직렬화됨.
  setMapDelta(mapKey: string, delta: MapDelta) {
    const maps = {
      ...(this.store.get("maps") as Record<string, MapDelta>),
      [mapKey]: delta,
    };
    this.store.set("maps", maps);
  }
}

export const dataManager = new DataManager();
