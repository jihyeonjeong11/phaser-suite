// 1. mapObject는 타일맵을 기반으로 받아서 object layer 구성.
// 2. 오브젝트 레이어로 각 타일별 속성 결정 = ex) 풀이 덮인 흙, 흙 타일은 interactable 함. 갈 수 있음.
// 3. player의 target 타일이 해당 타일을 보고 어떤 속성의 타일을 타겟하는지 제공해야 함.

// todo: 그 이후 store에 모든 맵의 데이터를 연결핡덧. - 해당 타일에 이 땅이 갈렸다? 등의 상태가 저장되어 있다면 덮어씌움
// 해당 변경된 맵 데이터는 세이브 로드 시 datamanager에서 관리하는 persistent 여야 농사 상태를 유지할 수 있음.

// ── 스타듀밸리 타일 프로퍼티 (타일맵에 박아둬서 런타임 계산 불필요) ──
//
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

//  - WeDias/StardewValley 디컴파일 — Tools/Hoe.cs, Tools/Pickaxe.cs, TerrainFeatures/ (https://github.com/WeDias/StardewValley/tree/main)

// ─────────────────────────────────────────────────────────────
// 구현 계획 (스타듀 GameLocation 의 역할)
// ─────────────────────────────────────────────────────────────
//
// [역할] 정적 타일맵(능력) + 동적 상태(store delta)를 합쳐,
//        "이 좌표의 칸이 뭐고 지금 상태가 뭐냐"를 한 곳에서 답한다.
//        레이어 지식(흙=Below Player, 오브젝트=World)을 여기에 가둔다 → Player는 좌표만 안다.
//
// [의존성 / 생성자]
//   - tilemap (또는 Worldmap): Below Player·World 레이어 접근용 (정적 능력)
//   - mapKey: 어느 맵인지 (store slice + 맵별 규칙)
//   - dataManager(store): 해당 맵 delta 읽기/쓰기 (동적 상태)
//
// [공개 API]
//   - getTileInfo(col, row): TileInfo       // 능력 + 점유/상태를 합쳐 반환 (Player·하이라이트가 사용)
//   - (Step2+) till(col,row) / mine(col,row) // 변형 → delta 갱신 → store 반영
//
// [TileInfo shape] — 능력(정적) + 상태(동적) 합침
//   능력(Below Player 프로퍼티에서):  type: "grass"|"dirt"|"stone"|...,  diggable: boolean
//   동적(delta 보드에서):            occupied, tilled, crop?, minedDay? ...
//   파생:                            interactable = diggable && !occupied   // 스타듀 공식과 동일
//
// [데이터 흐름]  store(maps[mapKey] delta)  ⇄  MapObject(래퍼)  →  Player(getTileInfo)
//   진입 시: store에 slice 있으면 로드, 없으면 능력에서 기본 생성. 변형 시 store에 되씀 → save 포함.
//
// ── 단계 (작게 쪼개서 각 층 검증) ──
//   Step 1  정적 능력만: getTileInfo 가 Below Player 레이어의 tile.properties(Diggable/Type)만 읽어 반환.
//                       store/delta 없음. Player target → getTileInfo → 하이라이트 색만 분기해 파이프라인 검증.
//   Step 2  동적 상태(메모리): till() 등으로 내부 Map<"col,row", delta>에 기록, getTileInfo 가 능력+상태 합쳐 반환.
//   Step 3  영속화: delta 를 dataManager.maps[mapKey] 로 read/write. 진입 시 로드, save()에 포함.

import { Tilemaps } from "phaser";
import { MapKey } from "../../game/utils/constants/mapKeys";
import { STATIC_TILE_PROPERTIES } from "../../game/utils/constants/tileProperties";
import { Features } from "./Components/features";
import { dataManager, HoeDirt } from "../../game/dataManager/Store";

// getTileInfo 반환 shape. Step1: 능력 중 Diggable 하나만.
export interface TileInfo {
  diggable: boolean;
  isOccupied: boolean;
}

// 1. 빈 map 형성
// 2. static tile: cliff의 경우 artifact tree 스프라이트 등록. 속성 isOccupied 등록, 여기서는 경작 불가
// 3. 정적 프로퍼티 확인, Diggable일때, map에 다른게 존재하지 않을때 useTool이 불릴 때 해당 맵에 등록
// 4. 타일 덮어씌움, map 객체 저장
// 5. 예외사항. 각 map 별로 static하게 배치한 오브젝트(이 경우는 game.ts의 artifact tree같은 경우는 따로 정적으로 tile 속성을 줘서 상호작용 불가해야함)

export class MapObject {
  private groundLayer: Tilemaps.TilemapLayer;
  private worldLayer: Tilemaps.TilemapLayer;

  private terrainFeatures = new Map<string, HoeDirt>();

  // ── 정적 점유 보드 (코드로 배치, 세이브 대상 아님) ──
  // Features가 배치한 artifact tree 밑동 등. (SDV: GameLocation.resourceClumps)
  private resourceClumps = new Set<string>();

  // 어느 맵인지 — store의 delta slice 키. (SDV: GameLocation.Name)
  private mapKey: MapKey;

  constructor(
    groundLayer: Tilemaps.TilemapLayer,
    worldLayer: Tilemaps.TilemapLayer,
    mapKey: MapKey,
  ) {
    this.groundLayer = groundLayer;
    this.worldLayer = worldLayer;
    this.mapKey = mapKey;
    new Features(mapKey, worldLayer, this.resourceClumps);
    this.loadDeltas();
  }

  // 갈린 흙 타일: plowed_soil 로컬 id 10 (가로2·세로4 = 중앙 균일 흙).
  private static readonly TILLED_LOCAL_ID = 10;

  private key(col: number, row: number): string {
    return `${col},${row}`;
  }

  // SDV GameLocation.doesTileHaveProperty(x, y, prop, "Back")에 대응. 여기선 Back=groundLayer 고정.
  private doesTileHaveProperty(
    col: number,
    row: number,
    prop: string,
  ): unknown {
    return this.groundLayer.getTileAt(col, row)?.properties?.[prop];
  }

  // SDV GameLocation.isTileOccupied. 여러 소스를 OR로 그때그때 조회해 파생 계산(점유 플래그 저장 X).
  isTileOccupied(col: number, row: number): boolean {
    const key = this.key(col, row);
    if (this.resourceClumps.has(key)) return true;
    if (this.worldLayer.getTileAt(col, row) != null) return true;
    if (this.terrainFeatures.has(key)) return true;
    return false;
  }

  // Debug 전용: 동적 보드(갈린 흙) 좌표 키 목록. ("col,row") DebugHud가 색칠에 사용.
  getTilledKeys(): string[] {
    return [...this.terrainFeatures.keys()];
  }

  // 능력(정적) + 점유(정적+동적)를 합쳐 반환. Player·하이라이트가 사용.
  getTileInfo(col: number, row: number): TileInfo {
    const diggable =
      this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) ===
      true;
    const isOccupied = this.isTileOccupied(col, row);
    return { diggable, isOccupied };
  }

  // SDV GameLocation.makeHoeDirt. 능력 && !점유 검사를 스스로 하고 terrainFeatures에 HoeDirt 등록.
  makeHoeDirt(col: number, row: number): void {
    if (
      this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) !==
      true
    )
      return; // 팔 수 없는 땅
    if (this.isTileOccupied(col, row)) return; // 점유됨(정적/동적, 이미 갈린 흙 포함)

    this.terrainFeatures.set(this.key(col, row), {
      state: 0, // dry
      fertilizer: 0, // none
      crop: null,
    });
    this.renderTilled(col, row);
    this.persist();
  }

  private renderTilled(col: number, row: number): void {
    const ts = this.groundLayer.tilemap.tilesets.find(
      (t) => t.name === "plowed_soil",
    );
    if (!ts) return;
    this.groundLayer.putTileAt(
      ts.firstgid + MapObject.TILLED_LOCAL_ID,
      col,
      row,
    );
  }

  private loadDeltas(): void {
    const saved = dataManager.getMapDelta(this.mapKey);
    for (const [key, dirt] of Object.entries(saved)) {
      this.terrainFeatures.set(key, dirt);
      const [col, row] = key.split(",").map(Number);
      this.renderTilled(col, row);
    }
  }

  private persist(): void {
    dataManager.setMapDelta(
      this.mapKey,
      Object.fromEntries(this.terrainFeatures),
    );
  }
}
