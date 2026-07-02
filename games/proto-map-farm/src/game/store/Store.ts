import { Data, Scene } from "phaser";

// inventory current scope
// characterdata if battle implemented money, hp, stamina...
// farm tile board(preserve farm object )
// farmable objects(plants, grass, stone, wood...)
// other tile board(if add customization & construction)
// entry point? after add all map sprites!
// global states(season, time, flags...)

// todo: save/load https://www.dynetisgames.com/2018/10/28/how-save-load-player-progress-localstorage/

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

// registry manager
export class Store {
  private registry: Data.DataManager;
  constructor(scene: Scene) {
    //playerdata
    // need item objects json
    this.registry = scene.registry;
    if (!this.registry.get("inventory")) {
      this.registry.set("inventory", TEMP_INV);
    }
  }
  get inventory() {
    return this.registry.get("inventory");
  }
  set inventory(v) {
    this.registry.set("inventory", v);
  }
}
