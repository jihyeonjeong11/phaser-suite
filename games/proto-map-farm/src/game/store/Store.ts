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
//        weapon1은 단일 이미지라 frame 없음
// type 추가 (weapon | tool | resource...) — 아직 미적용, 임시로 frame 유무로 Weapon/Tool 판별
export interface InventoryItem {
  name: string;
  textureKey: string;
  frame?: number;
  soundMap?: Record<string, string>;
}

const TEMP_INV: InventoryItem[] = [
  {
    name: "testing_rifle",
    textureKey: "weapon1", // 단일 이미지 (Preloader: load.image("weapon1"))
    frame: undefined,
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
