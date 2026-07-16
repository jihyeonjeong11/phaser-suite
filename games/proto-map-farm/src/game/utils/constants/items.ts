// todo: need to be json afterwards
//
export const TEMP_ITEMS = {
  axe: {
    // ClassName: 'Axe',
    Name: 'Axe',
    // AttachmentSlots: -1,
    //SalePrice: -1,
    DisplayName: 'Axe', //'[LocalizedText Strings\\Tools:Axe_Name]',
    Description: 'An axe.', //'[LocalizedText Strings\\Tools:Axe_Description]',
    Texture: 'TileSheets\\tools',
    SpriteIndex: 189,
    MenuSpriteIndex: 215,
    UpgradeLevel: 0,
    ConventionalUpgradeFrom: null,
    UpgradeFrom: null,
    CanBeLostOnDeath: false,
    SetProperties: null,
    ModData: null,
    CustomFields: null
  },
  wood: {
    name: 'wood',
    type: 'resource',
    textureKey: 'farming_fishing',
    frame: 5
  },
  scrap_metal: {
    name: 'scrap metal',
    type: 'resource',
    textureKey: 'apocalypse',
    frame: 80
  }
} as const

export type Item = (typeof TEMP_ITEMS)[keyof typeof TEMP_ITEMS]
export type Inventory = Item[]
