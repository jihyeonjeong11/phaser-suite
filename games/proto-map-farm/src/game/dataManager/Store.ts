import { Data, Events } from "phaser";

// inventory current scope
// characterdata if battle implemented money, hp, stamina...
// farm tile board(preserve farm object )
// farmable objects(plants, grass, stone, wood...)
// other tile board(if add customization & construction)
// entry point? after add all map sprites!
// global states(season, time, flags...)

// todo: save/load https://www.dynetisgames.com/2018/10/28/how-save-load-player-progress-localstorage/
// todo: need initialState

export const BASE_VOLUME = 0.5;

export interface GameOptions {
  volume: number;
}

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
    currentMapKey: "farm-map",
  },
  inventory: TEMP_INV,
  //options
  options: {
    volume: BASE_VOLUME,
  },
} as const;

// registry manager
class DataManager extends Events.EventEmitter {
  private static readonly SAVE_KEY = "proto-map-farm-save";
  private store: Data.DataManager;

  constructor() {
    super();
    this.store = new Data.DataManager(this);
    // initialize state with initial values
    this.store.set(initialState);
    //this.#updateDataManger(initialState);
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
      this.store.set(JSON.parse(raw));
      return true;
    } catch {
      return false;
    }
  }

  getPlayerData(): { x: number; y: number } {
    return this.store.get("player");
  }

  setPlayerData(pos: { x: number; y: number }) {
    this.store.set("player", pos);
  }

  getInventory() {
    return this.store.get("inventory");
  }

  setInventory(inventory: InventoryItem[]) {
    this.store.set("inventory", inventory);
  }

  getOption() {
    return this.store.get("options");
  }

  setOption(option: GameOptions) {
    this.store.set("options", option);
  }
}

export const dataManager = new DataManager();
