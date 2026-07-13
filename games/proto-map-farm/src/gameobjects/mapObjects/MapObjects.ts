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
import { MAP_KEYS, MapKey } from "../../game/utils/constants/mapKeys";
import { dataManager, MapDelta, TileObject } from "../../game/managers/Store";
import { StaticFeatures } from "./Components/StaticFeatures";
import { STATIC_TILE_PROPERTIES } from "../../game/utils/constants/tiles";

export interface TileInfo {
  diggable: boolean;
  isOccupied: boolean;
}

// 타일
export const Tiles = {
  "0": {
    Name: "Weeds",
    DisplayName: "[LocalizedText Strings\\Objects:Weeds_Name]",
    Description: "[LocalizedText Strings\\Objects:Weeds_Description]",
    Type: "Litter",
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
    CustomFields: null,
  },
};

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

export class MapObject {
  private belowLayer: Tilemaps.TilemapLayer;
  private worldLayer: Tilemaps.TilemapLayer;
  private resourceClumps = new Set<string>();
  private mapKey: MapKey;
  // 이미 그린 오브젝트 스프라이트("col,row" → Image). 같은 칸 중복 그림 방지.
  private drawnSprites = new Map<string, GameObjects.Image>();
  private board: MapDelta;
  // 실제 프레임 위치
  private static readonly GRASS_TILE_KEY = "tallgrass";
  private static readonly GRASS_FRAME = 16;
  private static readonly TILLED_TILE_KEY = "plowed_soil";
  private static readonly TILLED_FRAME = 10;
  // heart_anim 프레임 3 = 구슬 없는 나무(placeholder). 전용 트리 아트 생기면 교체.
  private static readonly TREE_TILE_KEY = "heart_anim";
  private static readonly TREE_FRAME = 3;
  // apocalypse 시트 프레임 80(가로1·세로3) = 표지판. ruin 데코.
  private static readonly SIGN_TILE_KEY = "apocalypse";
  private static readonly SIGN_FRAME = 80;

  constructor(
    belowLayer: Tilemaps.TilemapLayer,
    worldLayer: Tilemaps.TilemapLayer,
    mapKey: MapKey,
  ) {
    this.belowLayer = belowLayer;
    this.worldLayer = worldLayer;
    this.mapKey = mapKey;
    // 현재는 Cliff에 아티팩트 트리만 렌더.
    if (mapKey === MAP_KEYS.CLIFF) {
      new StaticFeatures(mapKey, worldLayer, this.resourceClumps);
      // For initial render, loop each tiles and compute objects at random.
      if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
        let initialMap: Record<string, TileObject> = {};
        this.belowLayer.forEachTile((t) => {
          if (t.properties.Diggable && !this.isTileOccupied(t.x, t.y)) {
            const roll = Math.FloatBetween(0, 1);
            if (roll > 0.9) {
              // todo: need resource features
              initialMap[this.posToString(t.x, t.y)] = { kind: "tree" }; // ~10%
            } else if (roll > 0.7) {
              initialMap[this.posToString(t.x, t.y)] = { kind: "grass" }; // ~20%
            }
          }
        });
        dataManager.setMap(mapKey, initialMap);
      }
    } else if (mapKey === MAP_KEYS.RUIN) {
      // ruin은 Diggable 타일이 없어서, 점유 안 된 칸에 낮은 확률로 표지판 배치.
      if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
        const initialMap: Record<string, TileObject> = {};
        this.belowLayer.forEachTile((t) => {
          if (
            !this.isTileOccupied(t.x, t.y) &&
            Math.FloatBetween(0, 1) > 0.99
          ) {
            initialMap[this.posToString(t.x, t.y)] = { kind: "sign" }; // ~1%
          }
        });
        dataManager.setMap(mapKey, initialMap);
      }
    }
    // 그 다음 렌더
    this.update();
  }

  update() {
    this.board = dataManager.getMap(this.mapKey);
    Object.entries(this.board).forEach(([posString, k]) => {
      const [col, row] = this.stringToPos(posString);
      switch (k.kind) {
        case "grass":
          this.drawGrass(col, row);
          break;
        case "tree":
          this.drawTree(col, row);
          break;
        case "sign":
          this.drawSign(col, row);
          break;
        case "tilled":
          this.drawTilled(col, row);
          break;
      }
    });
    // 2. 그렸는데 board에서 사라진 칸 → 스프라이트 파괴
    for (const [key, img] of this.drawnSprites) {
      if (this.board[key] === undefined) {
        img.destroy();
        this.drawnSprites.delete(key);
      }
    }
  }

  removeFeature(col: number, row: number): void {
    const board = dataManager.getMap(this.mapKey);
    const key = this.posToString(col, row);
    if (board[key] === undefined) return;
    delete board[key];
    dataManager.setMap(this.mapKey, board);
  }

  addFeature(col: number, row: number, feature: TileObject): void {
    const board = dataManager.getMap(this.mapKey);
    const key = this.posToString(col, row);
    if (board[key] !== undefined) return;
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

  private drawTree(col: number, row: number): void {
    const key = this.posToString(col, row);
    if (this.drawnSprites.has(key)) return;

    const scene = this.worldLayer.scene;
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16;
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 32;
    const img = scene.add
      .image(wx, wy, MapObject.TREE_TILE_KEY, MapObject.TREE_FRAME)
      .setOrigin(0.5, 1)
      .setDepth(wy)
      .setData("isPassable", false);
    this.drawnSprites.set(key, img);
  }

  private drawSign(col: number, row: number): void {
    const key = this.posToString(col, row);
    if (this.drawnSprites.has(key)) return;

    const scene = this.worldLayer.scene;
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16;
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 32;
    const img = scene.add
      .image(wx, wy, MapObject.SIGN_TILE_KEY, MapObject.SIGN_FRAME)
      .setOrigin(0.5, 1)
      .setDepth(wy)
      .setData("isPassable", false);
    this.drawnSprites.set(key, img);
  }

  private drawTilled(col: number, row: number): void {
    const key = this.posToString(col, row);
    if (this.drawnSprites.has(key)) return;

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

  swingAxe(col: number, row: number) {
    this.removeFeature(col, row);
  }
  swingPickaxe(col: number, row: number) {
    this.removeFeature(col, row);
  }

  water(col: number, row: number): void {
    const board = dataManager.getMap(this.mapKey);
    const key = this.posToString(col, row);
    const feat = board[key];
    if (feat?.kind !== "tilled" || feat.state === 1) return;
    feat.state = 1;
    dataManager.setMap(this.mapKey, board);
    this.drawnSprites.get(key)?.setTint(0x6f8fb0); // 젖은 색조
  }

  till(col: number, row: number): void {
    this.addFeature(col, row, {
      kind: "tilled",
      state: 0,
      fertilizer: 0,
      crop: null,
    });
    this.update();
  }

  private doesTileHaveProperty(
    col: number,
    row: number,
    prop: string,
  ): unknown {
    return this.belowLayer.getTileAt(col, row)?.properties?.[prop];
  }

  isTileOccupied(col: number, row: number): boolean {
    const key = `${col},${row}`;
    if (this.resourceClumps.has(key)) return true;
    if (this.worldLayer.getTileAt(col, row) != null) return true;
    return false;
  }

  isTilePassable(col: number, row: number): boolean {
    const img = this.drawnSprites.get(this.posToString(col, row));
    return img?.getData("isPassable") ?? true;
  }

  getTileInfo(col: number, row: number) {
    const diggable =
      this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) ===
      true;
    const watersource =
      this.doesTileHaveProperty(
        col,
        row,
        STATIC_TILE_PROPERTIES.WATERSOURCE,
      ) === true;
    const action = this.doesTileHaveProperty(
      col,
      row,
      STATIC_TILE_PROPERTIES.ACTION,
    );
    const isOccupied = this.isTileOccupied(col, row);
    const feature =
      dataManager.getMap(this.mapKey)[this.posToString(col, row)] ?? null;
    return { diggable, isOccupied, feature, watersource, action };
  }
}

// expand)

// ● 코드 다시 봤습니다. 지금 상황을 일반 게임개발 관점에서 정확히 재정의하면, 이건 "모델–뷰 동기화(Model–View sync)" 문제입니다. Phaser는 잊고 그 관점에서만
//   정리하겠습니다.

//   지금 당신이 가진 3개의 층 (개념적으로)

//   ┌──────────────────────┬────────────────────────────────────────────────────────────┬───────────────────────────────────────────┐
//   │          층          │                         지금 코드                          │                   성격                    │
//   ├──────────────────────┼────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
//   │ 정적 능력(static)    │ 타일맵 프로퍼티 (Diggable, Water...)                       │ 불변. Tiled에 박혀 있음                   │
//   ├──────────────────────┼────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
//   │ 동적 상태(OBJECTMAP) │ dataManager.getMap(mapKey) = Record<"col,row", TileObject> │ 모델. 상호작용으로 변함. 저장 대상        │
//   ├──────────────────────┼────────────────────────────────────────────────────────────┼───────────────────────────────────────────┤
//   │ 뷰(view)             │ drawnSprites: Map<"col,row", Image>                        │ 파생물. 모델에서 언제든 다시 만들 수 있음 │
//   └──────────────────────┴────────────────────────────────────────────────────────────┴───────────────────────────────────────────┘

//   핵심 통찰: 뷰 = f(모델). 스프라이트는 모델에서 파생된 그림자일 뿐이고, 언제 다 지우고 다시 그려도 똑같아야 합니다. "업데이트를 어떻게 하느냐"는 곧 "이 등식을
//   어떻게 값싸게 유지하느냐" 입니다.

//   지금 코드의 근본 문제 2가지 (일반 원칙 위반)

//   ① 뷰가 모델을 겸하고 있음 (view-as-model 안티패턴)
//   isTilePassable(col, row) {
//     const img = this.drawnSprites.get(...);      // 스프라이트(뷰)에서
//     return img?.getData("isPassable") ?? true;   // 통행 여부(모델)를 읽음
//   }
//   통행 가능성은 모델의 속성인데 스프라이트(뷰)에 저장돼 있습니다. 뷰는 언제든 파괴·재생성되는 임시물이라, 뷰를 지우면 게임 규칙(통행)이 사라집니다. 모든 판정
//   데이터는 모델에 있어야 합니다.

//   ② 갱신 경로가 제각각 (split-brain)
//   - till() → 모델 수정 후 update() (전체 재diff)
//   - removeFeature() → 모델만 수정, 갱신 안 함 (매 프레임 update에 의존)
//   - water() → 모델 수정 + 스프라이트 직접 setTint (뷰 직접 조작)

//   같은 "변경"인데 세 가지 다른 방식으로 뷰를 맞춥니다. 이게 버그의 온상입니다.

//   업데이트 전략 — 일반적으로 3가지, 순위대로

//   ┌─────────────────────────────────────┬────────────────────────────────────────────┬───────────────┬──────────────────────────────────────────────────────┐
//   │                전략                 │                    방식                    │     비용      │                         언제                         │
//   ├─────────────────────────────────────┼────────────────────────────────────────────┼───────────────┼──────────────────────────────────────────────────────┤
//   │ A. 매 틱 전체 재구축 (immediate)    │ 매 프레임 뷰 버리고 모델로 재생성          │ O(N)/프레임   │ 아주 작거나 거의 정적인 맵 (Stardew식)               │
//   ├─────────────────────────────────────┼────────────────────────────────────────────┼───────────────┼──────────────────────────────────────────────────────┤
//   │ B. 변경 시 전체 재diff (coarse      │ 뭔가 바뀌면 dirty 플래그 → 다음 틱에 전체  │ O(N)/변경묶음 │ 중간. 단순·견고 (= 지금 update()를 플래그로 게이팅한 │
//   │ dirty)                              │ 비교                                       │               │  것)                                                 │
//   ├─────────────────────────────────────┼────────────────────────────────────────────┼───────────────┼──────────────────────────────────────────────────────┤
//   │ C. 국소 무효화 (fine-grained)       │ 변경된 칸만 뷰 갱신                        │ O(변경 칸)    │ 큰 맵. 최소 작업 ✅                                  │
//   └─────────────────────────────────────┴────────────────────────────────────────────┴───────────────┴──────────────────────────────────────────────────────┘

//   일반적으로 가장 바람직한 답은 C (국소 무효화) 입니다. 타일 기반 게임의 표준이에요 — Minecraft 청크 dirty, Factorio, Stardew의 TerrainFeature 갱신 모두 "바뀐
//   것만 건드린다"입니다.

//   그걸 안전하게 만드는 2개의 일반 규칙

//   규칙 1 — 변경 깔때기(mutation funnel)
//   모델을 바꾸는 길은 딱 몇 개의 명령 함수뿐이어야 합니다 (till, water, place, remove...). 외부 코드가 board를 직접 못 만짐. 그래야 "뷰가 모르는 변경"이
//   원천적으로 불가능 → 국소 갱신이 신뢰 가능.

//   규칙 2 — 단일 원시함수 syncCell(coord)
//   "이 칸 하나를 모델 상태와 일치시켜라"는 멱등(idempotent) 함수 하나를 만듭니다. 그 칸의 모델 상태를 읽어서:
//   - 모델엔 있는데 뷰엔 없음 → 생성
//   - 둘 다 있는데 다름 → 갱신 (예: 젖음 tint)
//   - 모델엔 없는데 뷰엔 있음 → 파괴

//   그러면 모든 전략이 이 한 함수 위에 서게 됩니다:
//   - 전략 C: mutate → syncCell(그 칸)
//   - 전략 A/B(전체): for (칸 of 전체) syncCell(칸)

//   → 지금처럼 drawGrass/drawTilled/setTint가 흩어진 split-brain이 하나로 합쳐집니다. 그리기 로직 중복 제거.

//   실전 권장: C + dirty set 배칭

//   명령들이 바뀐 좌표를 dirty: Set<coord>에 넣고, 틱당 한 번 비웁니다:
//   mutate(coord): 모델 변경 → dirty.add(coord)
//   flush(): for (coord of dirty) syncCell(coord); dirty.clear()
//   이점:
//   - 중복 제거: 한 틱에 같은 칸이 여러 번 바뀌어도 1번만 sync.
//   - 배칭: 광역 변경(예: 스프링클러가 9칸 적심)도 한 번에.
//   - 디커플링: "언제 모델이 바뀌나"와 "언제 뷰를 맞추나"를 분리 → 시뮬레이션 로직이 렌더 타이밍에 안 묶임.

//   이게 A(매 프레임 전체, 지금 문제의 원인)와 정반대이자, 일반적으로 가장 바람직한 지점입니다.

//   덤으로 깨끗해지는 것들

//   - 저장/로드: 뷰가 파생물이므로 모델(OBJECTMAP delta)만 직렬화. 로드 시 전체 syncCell 한 번으로 뷰 재구축. (당신 comment의 Step 3 그대로)
//   - 맵 전환: 모델 슬라이스 교체 + 전체 sync 1회. 지금 씬 재시작마다 재생성하는 것과 자연스럽게 맞음.
//   - 통행/점유 판정: 전부 모델에서 → 뷰 없어도 규칙 유지 (①번 문제 해소).

//   목표 아키텍처 한 장 요약

//   [정적 능력] 타일맵 프로퍼티 (읽기전용)
//         +
//   [모델] OBJECTMAP: coord → objectState   ← 유일한 진실, 저장 대상
//         │  (변경은 오직 명령 함수로: till/water/remove/place)
//         │  변경 → dirty.add(coord)
//         ▼
//   [flush] dirty의 각 coord에 syncCell(coord)   ← 멱등, 유일한 그리기 경로
//         ▼
//   [뷰] 스프라이트 (파생물, 언제든 재구축 가능)

//   판정 API(getTileInfo, isTilePassable, isTileOccupied)는 전부 모델·정적능력만 읽고, 뷰는 절대 안 읽음.

//   ---
//   여기까지가 엔진 무관 설계입니다. 이 방향(모델=유일 진실 / 변경은 명령 깔때기 / dirty set + 멱등 syncCell / 뷰는 파생)에 동의하시면, 다음 단계로 이걸 Phaser에
//   어떻게 얹을지(누가 syncCell을 호출할지 — 명령 직후 즉시 vs 프레임 flush, 스프라이트 add/destroy 매핑, depth 정렬 등)를 잡으면 됩니다.

//   한 가지 확인하고 싶은 게 있는데, 답에 따라 dirty flush를 "즉시" 할지 "틱 배칭"할지가 갈립니다:
