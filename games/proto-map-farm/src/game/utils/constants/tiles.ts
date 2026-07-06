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
export const BASE_INTERACTABLE_TILE_FRAME = 19;

export const BASE_TILLED_TILE_FRAME = 10;

// World Layer

// todo: add more properties!
export const STATIC_TILE_PROPERTIES = {
  DIGGABLE: "Diggable",
  WATERSOURCE: "watersource",
} as const;

export const DYNAMIC_TILE_PROPERTIES = {
  ISOCCUPIED: "IsOccupied",
} as const;
