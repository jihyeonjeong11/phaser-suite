import { CropKey } from './crops'

// todo: add more properties!
export const STATIC_TILE_PROPERTIES = {
  DIGGABLE: 'Diggable',
  WATERSOURCE: 'watersource',
  ACTION: 'Action'
} as const

export const DYNAMIC_TILE_PROPERTIES = {
  ISOCCUPIED: 'IsOccupied'
} as const

export const TEMP_OBJECT_TILES = {
  grass: {
    name: 'grass',
    type: 'Litter',
    texture: 'tallgrass',
    frame: 16,
    isPassable: true,
    isOccupied: false
  },
  tree: {
    name: 'tree',
    type: 'resource',
    // farm_tiles.png의 32×64 뷰. 프레임 8 = (col 8, row 0), 실제 그림 25×63px.
    texture: 'farm_objects',
    frame: 8,
    isPassable: false,
    isOccupied: true
  },
  sign: {
    name: 'sign',
    type: 'Scrap',
    texture: 'apocalypse',
    frame: 80,
    isPassable: false,
    isOccupied: true
  },
  tilled: {
    name: 'tilled_dirt',
    type: 'Crop',
    texture: 'plowed_soil',
    frame: 15,
    watered: false as boolean,
    isPassable: true,
    isOccupied: false,
    // 심어진 작물이 있을 때만 채워짐 (없으면 빈 tilled_dirt)
    cropKey: undefined as CropKey | undefined,
    growthStage: undefined as number | undefined,
    daysInStage: undefined as number | undefined
  }
} as const

export type Tile = (typeof TEMP_OBJECT_TILES)[keyof typeof TEMP_OBJECT_TILES]
export type ObjectMap = Record<string, Tile>

// from stardew valley for ref
export const Tiles = {
  '0': {
    Name: 'Weeds',
    DisplayName: '[LocalizedText Strings\\Objects:Weeds_Name]',
    Description: '[LocalizedText Strings\\Objects:Weeds_Description]',
    Type: 'Litter',
    Category: -999,
    Price: 0,
    Texture: null,
    SpriteIndex: 0,
    ColorOverlayFromNextIndex: false,
    Edibility: -300,
    IsDrink: false,
    Buffs: null,
    GeodeDropsDefaultItems: false,
    GeodeDrops: null,
    ArtifactSpotChances: null,
    CanBeGivenAsGift: true,
    CanBeTrashed: true,
    ExcludeFromFishingCollection: false,
    ExcludeFromShippingCollection: false,
    ExcludeFromRandomSale: false,
    ContextTags: null,
    CustomFields: null
  }
}
