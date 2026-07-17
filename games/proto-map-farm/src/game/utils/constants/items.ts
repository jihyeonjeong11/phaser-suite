// todo: need to be json afterwards
//
// 원래 axe 항목에 있던 스타듀밸리 원본 스키마 (참고용, 추후 json 전환 시 필드 매핑 참고)
// {
//   ClassName: 'Axe',
//   Name: 'Axe',
//   AttachmentSlots: -1,
//   SalePrice: -1,
//   DisplayName: 'Axe', //'[LocalizedText Strings\\Tools:Axe_Name]',
//   Description: 'An axe.', //'[LocalizedText Strings\\Tools:Axe_Description]',
//   Texture: 'TileSheets\\tools',
//   SpriteIndex: 189,
//   MenuSpriteIndex: 215,
//   UpgradeLevel: 0,
//   ConventionalUpgradeFrom: null,
//   UpgradeFrom: null,
//   CanBeLostOnDeath: false,
//   SetProperties: null,
//   ModData: null,
//   CustomFields: null
// }
export const TEMP_ITEMS = {
  testing_rifle: {
    name: 'testing_rifle',
    type: 'weapon',
    textureKey: 'weapons', // 스프라이트시트 "weapons"의 frame 0 (Preloader: load.spritesheet)
    frame: undefined, // undefined = Weapon으로 판별 + 기본 frame 0 렌더
    soundMap: {
      //fire, reload
    }
  },
  testing_watering_can: {
    name: 'testing_watering_can',
    type: 'tool',
    textureKey: 'tools', // spritesheet "tools"
    frame: 0,
    soundMap: {
      //pour, refill
    }
  },
  testing_pickaxe: {
    name: 'testing_pickaxe',
    type: 'tool',
    textureKey: 'tools',
    frame: 1,
    soundMap: {
      //mine
    }
  },
  testing_hoe: {
    name: 'testing_hoe',
    type: 'tool',
    textureKey: 'tools',
    frame: 2,
    soundMap: {
      //till
    }
  },
  testing_axe: {
    name: 'testing_axe',
    type: 'tool',
    textureKey: 'tools',
    frame: 2,
    soundMap: {
      //chop
    }
  },
  wood: {
    name: 'wood',
    type: 'resource',
    textureKey: 'farming_fishing',
    frame: 5,
    maxStack: 100,
    currentStack: 0
  },
  scrap_metal: {
    name: 'scrap metal',
    type: 'resource',
    textureKey: 'apocalypse',
    frame: 80,
    maxStack: 100,
    currentStack: 0
  },
  seed_corn: {
    name: 'Corn seed',
    type: 'seed',
    textureKey: 'plants',
    frame: 15,
    maxStack: 100,
    currentStack: 0
  },
  crop_corn: {
    name: 'Corn',
    type: 'crop',
    textureKey: 'plants',
    frame: 'corn_harvest',
    maxStack: 100,
    currentStack: 0
  }
} as const

export type Item = (typeof TEMP_ITEMS)[keyof typeof TEMP_ITEMS]
export type Inventory = Item[]
