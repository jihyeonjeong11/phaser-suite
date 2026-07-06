// [정적 프로퍼티 — Tiled 타일에 심어둠]
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
// [동적 점유 — 프로퍼티 아님! 런타임 상태로 판정]
//   - 상자/가구/작물/나무 = 그 좌표에 Object·TerrainFeature 존재 → isTileOccupied → 못 감
//   - 실제 괭이 조건: doesTileHaveProperty(x,y,"Diggable","Back") && !isTileOccupied(tile) && isTilePassable(...)
//   → 이 "동적 점유"가 우리 delta 보드(좌표→상태)의 역할.

// Tiled 타일에 심어둔 정적 프로퍼티 이름(진실의 원천). doesTileHaveProperty로 읽는다.
// todo: add more properties!
export const STATIC_TILE_PROPERTIES = {
  DIGGABLE: "Diggable",
} as const;

// 런타임 파생 상태(Tiled 프로퍼티 아님). isTileOccupied가 여러 소스를 OR로 계산.
export const DYNAMIC_TILE_PROPERTIES = {
  ISOCCUPIED: "IsOccupied",
} as const;
