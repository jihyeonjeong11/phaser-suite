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

import { GameObjects, Math, Tilemaps } from "phaser";
import { MapKey } from "../../game/utils/constants/mapKeys";
import { dataManager, TileObject } from "../../game/dataManager/Store";
import { StaticFeatures } from "./Components/StaticFeatures";
import { STATIC_TILE_PROPERTIES } from "../../game/utils/constants/tiles";

export interface TileInfo {
  diggable: boolean;
  isOccupied: boolean;
}

export class MapObject {
  private belowLayer: Tilemaps.TilemapLayer;
  private worldLayer: Tilemaps.TilemapLayer;
  private resourceClumps = new Set<string>();
  private mapKey: MapKey;
  // 이미 그린 오브젝트 스프라이트("col,row" → Image). 같은 칸 중복 그림 방지.
  private drawnSprites = new Map<string, GameObjects.Image>();
  // 실제 프레임 위치
  private static readonly GRASS_TILE_KEY = "tallgrass";
  private static readonly GRASS_FRAME = 16;
  private static readonly TILLED_TILE_KEY = "plowed_soil";
  private static readonly TILLED_FRAME = 10;

  constructor(
    belowLayer: Tilemaps.TilemapLayer,
    worldLayer: Tilemaps.TilemapLayer,
    mapKey: MapKey,
  ) {
    this.belowLayer = belowLayer;
    this.worldLayer = worldLayer;
    this.mapKey = mapKey;
    // 현재는 Cliff에 아티팩트 트리만 렌더.
    new StaticFeatures(mapKey, worldLayer, this.resourceClumps);
    // For initial render, loop each tiles and compute objects at random.
    if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
      let initialMap: Record<string, TileObject> = {};
      this.belowLayer.forEachTile((t) => {
        // 갈 수 있는 타일 && worldLayer 오브젝트·resourceClump에 안 막힌 칸에만 배치
        if (t.properties.Diggable && !this.isTileOccupied(t.x, t.y)) {
          const grassProbability = Math.Between(0, 1);
          if (grassProbability > 0.7) {
            initialMap[this.posToString(t.x, t.y)] = { kind: "grass" };
          }
        }
      });
      dataManager.setMap(mapKey, initialMap);
    }
    // 그 다음 렌더
    this.update();
  }

  update() {
    const board = dataManager.getMap(this.mapKey);
    // 1. board에 있는데 아직 안 그린 칸 → 그림
    Object.entries(board).forEach(([posString, k]) => {
      const [col, row] = this.stringToPos(posString);
      switch (k.kind) {
        case "grass":
          this.drawGrass(col, row);
          break;
        case "tilled":
          this.drawTilled(col, row);
          break;
      }
    });
    // 2. 그렸는데 board에서 사라진 칸 → 스프라이트 파괴
    for (const [key, img] of this.drawnSprites) {
      if (board[key] === undefined) {
        img.destroy();
        this.drawnSprites.delete(key);
      }
    }
  }

  // 논리 보드에서 그 칸을 제거 → store 갱신 → 리렌더로 스프라이트 정리.
  removeFeature(col: number, row: number): void {
    const board = dataManager.getMap(this.mapKey);
    const key = this.posToString(col, row);
    if (board[key] === undefined) return;
    delete board[key];
    dataManager.setMap(this.mapKey, board);
  }

  // removeFeature의 대칭. 논리 보드에 그 칸을 기록 → store 갱신 → 리렌더가 스프라이트 생성.
  addFeature(col: number, row: number, feature: TileObject): void {
    const board = dataManager.getMap(this.mapKey);
    const key = this.posToString(col, row);
    if (board[key] !== undefined) return; // 이미 뭔가 있으면 덮지 않음
    board[key] = feature;
    dataManager.setMap(this.mapKey, board);
  }

  private drawGrass(col: number, row: number): void {
    const key = this.posToString(col, row);
    if (this.drawnSprites.has(key)) return; // 이미 그려둠

    const scene = this.belowLayer.scene;
    const wx = (this.belowLayer.tileToWorldX(col) ?? 0) + 16;
    const wy = (this.belowLayer.tileToWorldY(row) ?? 0) + 32;
    const img = scene.add
      .image(wx, wy, MapObject.GRASS_TILE_KEY, MapObject.GRASS_FRAME)
      .setOrigin(0.5, 1);
    // img.setDepth(img.y);
    this.drawnSprites.set(key, img);
  }

  private drawTilled(col: number, row: number): void {
    const key = this.posToString(col, row);
    if (this.drawnSprites.has(key)) return; // 이미 그려둠

    const scene = this.belowLayer.scene;
    const wx = (this.belowLayer.tileToWorldX(col) ?? 0) + 16;
    const wy = (this.belowLayer.tileToWorldY(row) ?? 0) + 32;
    const img = scene.add
      .image(wx, wy, MapObject.TILLED_TILE_KEY, MapObject.TILLED_FRAME)
      .setOrigin(0.5, 1);
    this.drawnSprites.set(key, img);
  }

  private posToString(col: number, row: number): string {
    return `${col},${row}`;
  }

  private stringToPos(s: string): [number, number] {
    const [col, row] = s.split(",").map(Number);
    return [col, row];
  }

  // 흙 갈기: 논리 보드에 tilled 상태 기록 → 리렌더가 갈린 흙 스프라이트 생성.
  till(col: number, row: number): void {
    this.addFeature(col, row, {
      kind: "tilled",
      state: 0,
      fertilizer: 0,
      crop: null,
    });
    this.update();
  }

  // SDV GameLocation.doesTileHaveProperty(x, y, prop, "Back")에 대응. 여기선 Back=belowLayer 고정.
  private doesTileHaveProperty(
    col: number,
    row: number,
    prop: string,
  ): unknown {
    return this.belowLayer.getTileAt(col, row)?.properties?.[prop];
  }

  // SDV GameLocation.isTileOccupied. 여러 소스를 OR로 그때그때 조회해 파생 계산(점유 플래그 저장 X).
  isTileOccupied(col: number, row: number): boolean {
    const key = `${col},${row}`;
    if (this.resourceClumps.has(key)) return true;
    if (this.worldLayer.getTileAt(col, row) != null) return true;
    return false;
  }

  // 능력(정적) + 점유(정적+동적)를 합쳐 반환. Player·하이라이트가 사용.
  getTileInfo(col: number, row: number) {
    const diggable =
      this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) ===
      true;
    const isOccupied = this.isTileOccupied(col, row);
    const feature =
      dataManager.getMap(this.mapKey)[this.posToString(col, row)] ?? null;
    return { diggable, isOccupied, feature };
  }

  private persist(): void {
    //   dataManager.setMapDelta(
    //     this.mapKey,
    //     Object.fromEntries(this.terrainFeatures),
    //   );
  }
}
