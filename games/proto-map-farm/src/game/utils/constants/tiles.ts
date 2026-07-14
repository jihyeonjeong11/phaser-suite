// [정적 프로퍼티 — Tiled 타일에 심어둠] stardewvalley
//  Back 레이어(지면):
//   - Diggable    : 괭이질/파기 가능 (Hoe·Pickaxe 둘 다 이걸로 판정)
//   - Type        : 지면 종류 = "Dirt"|"Grass"|"Stone"|"Wood"|"Wet"|"Sand"|"Cobble"|"Snow"|"Metal"|"Rug" (발소리/행동 분기)
//   - Water       : 물 타일
//   - WaterSource : 물뿌리개 리필 가능
//   - NoSpawn     : "All"|"Grass"|"Tree" — 잡초/풀/나무 스폰 금지
//   - NoFurniture : 가구 배치 금지
//   - NoSprinklers: 스프링클러 배치 금지
//   - Buildable   : 건물 배치 가능(농장)
//   - Passable / NPCBarrier : 통행 강제 / NPC 통행 금지
//  Buildings 레이어(구조물):
//   - Action      : 클릭 시 동작 = "Door" | "Warp x y map" | "Message ..." | "Lock" | "OpenShop" ...
//   - Passable    : "T"면 구조물이어도 통행 가능
//  Front / AlwaysFront:
//   - TouchAction : 밟으면 발동 = "MagicWarp" | "Emote" | "ChangeIntoSwimsuit" ...
//

// Ground layer
export const BASE_INTERACTABLE_TILE_FRAME = 19

export const BASE_TILLED_TILE_FRAME = 10

// World Layer

// todo: add more properties!
export const STATIC_TILE_PROPERTIES = {
  DIGGABLE: 'Diggable',
  WATERSOURCE: 'watersource',
  ACTION: 'action'
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
    texture: 'heart_anim',
    frame: 3,
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
    isOccupied: false
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

// ─────────────────────────────────────────────────────────────
// 우리가 "지금" 필요한 값들 (스타듀 스키마에서 추려낸 최소 형태)
// ─────────────────────────────────────────────────────────────
// 위 Weeds 항목은 스타듀 Data/Objects 원본. 필드 대부분(Price/Edibility/
// Buffs/Geode.../Collection...)은 상점·요리·경제 시스템용이라 지금은 불필요.
// 우리 렌더/판정 코드가 실제로 읽는 값만 남기면 아래 정도:
//
// Tiles["grass"] = {
//   // ── 식별 ──
//   Name: "Grass",              // 표시용 (스듀 Name)
//   Type: "Litter",            // 분류 = "Litter"(잡초/돌) | "Crop" | "Structure" ...
//
//   // ── 렌더 (스듀엔 Texture+SpriteIndex, Phaser는 textureKey+frame) ──
//   Texture: "tallgrass",      // Phaser 텍스처 키 (스듀 Texture)
//   SpriteIndex: 16,           // 스프라이트시트 프레임 (스듀 SpriteIndex)
//   Layer: "below",            // "below"=지면(정렬X) | "world"=오브젝트(depth=wy 정렬)  ← 스듀엔 없음, 엔진 필요
//
//   // ── 판정(모델 규칙) — 뷰 아닌 여기서 읽어야 함 ──
//   Passable: true,            // 통행 가능? (스듀 타일 프로퍼티 Passable). false면 나무/표지판처럼 막힘
//   Occupies: false,           // 이 칸을 점유해 다른 배치 막나? (isTileOccupied 판정)
// };
//
// [현재 우리 kind 목록과 매핑]  (Store.TileObject / MapObject draw* 기준)
//   grass  → Texture "tallgrass",   frame 16, below, Passable true
//   tilled → Texture "plowed_soil", frame 10, below, Passable true   (+동적: state/fertilizer/crop)
//   tree   → Texture "heart_anim",  frame 3,  world, Passable false
//   sign   → Texture "apocalypse",  frame 80, world, Passable false
//   stone  → (미구현) Type "Litter", world, Passable false
//
// ⚠️ 불일치: Store.TileObject 는 grass|stone|tilled 인데 draw*는 grass|tree|sign|tilled.
//    JSON kind 키로 이 목록을 단일화(kind = keyof Tiles)해야 함.
//
// [정적 vs 동적 구분] 위 필드는 전부 정적(불변). tilled의 state/fertilizer/crop 같은
//    "변하는 상태"는 여기 넣지 말 것 — 그건 store delta(모델)로 감. 이 Tiles는 "정적 능력" 층.
