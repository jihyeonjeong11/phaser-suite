import { GameObjects, Math, Tilemaps } from 'phaser'
import { MAP_KEYS, MapKey } from '../../game/utils/constants/mapKeys'
import { dataManager } from '../../game/managers/Store'
import { StaticFeatures } from './Components/StaticFeatures'
import {
  ObjectMap,
  STATIC_TILE_PROPERTIES,
  TEMP_OBJECT_TILES,
  Tile
} from '../../game/utils/constants/tiles'

export class MapObject {
  private belowLayer: Tilemaps.TilemapLayer
  private worldLayer: Tilemaps.TilemapLayer
  private resourceClumps = new Set<string>()
  private mapKey: MapKey
  private drawnSprites = new Map<string, GameObjects.Image>()

  constructor(
    belowLayer: Tilemaps.TilemapLayer,
    worldLayer: Tilemaps.TilemapLayer,
    mapKey: MapKey
  ) {
    this.belowLayer = belowLayer
    this.worldLayer = worldLayer
    this.mapKey = mapKey
    if (mapKey === MAP_KEYS.CLIFF) {
      new StaticFeatures(mapKey, worldLayer, this.resourceClumps)
      if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
        const initialMap: ObjectMap = Object.assign({}, {} as ObjectMap)
        let treeNumber = 0
        this.belowLayer.forEachTile((t) => {
          if (
            !this.worldLayer.getTileAt(t.x, t.y) &&
            t.properties.Diggable &&
            !this.isTileOccupied(t.x, t.y)
          ) {
            const roll = Math.FloatBetween(0, 1)
            if (roll > 0.98 && treeNumber < 10) {
              initialMap[this.posToString(t.x, t.y)] = TEMP_OBJECT_TILES.tree
              treeNumber++
            } else if (roll > 0.7) {
              initialMap[this.posToString(t.x, t.y)] = TEMP_OBJECT_TILES.grass
            }
          }
        })
        dataManager.setMap(mapKey, initialMap)
      }
    } else if (mapKey === MAP_KEYS.RUIN) {
      if (Object.keys(dataManager.getMap(mapKey)).length === 0) {
        const initialMap: Record<string, Tile> = {}
        this.belowLayer.forEachTile((t) => {
          if (!this.isTileOccupied(t.x, t.y) && Math.FloatBetween(0, 1) > 0.99) {
            initialMap[this.posToString(t.x, t.y)] = TEMP_OBJECT_TILES.sign
          }
        })
        dataManager.setMap(mapKey, initialMap)
      }
    }

    this.draw()
    dataManager.on('changedata-interactableMaps', () => {
      this.draw()
    })
  }

  draw() {
    Object.entries(dataManager.getMap(this.mapKey)).forEach(([posString, k]) => {
      const [col, row] = this.stringToPos(posString)
      switch (k.name) {
        case 'grass':
          this.drawGrass(col, row, k)
          break
        case 'tree':
          this.drawTree(col, row, k)
          break
        case 'sign':
          this.drawSign(col, row, k)
          break
        case 'tilled_dirt':
          this.drawTilled(col, row, k)
          break
      }
    })

    const board = dataManager.getMap(this.mapKey)
    for (const [key, img] of this.drawnSprites) {
      if (board[key] === undefined) {
        img.destroy()
        this.drawnSprites.delete(key)
      }
    }
  }

  removeFeature(col: number, row: number): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    if (board[pos] === undefined) return
    const rest = { ...board }
    delete rest[pos]
    dataManager.setMap(this.mapKey, rest)
  }

  addFeature(col: number, row: number, feature: Tile): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    console.log(feature)
    if (board[pos] !== undefined) return
    dataManager.setMap(this.mapKey, { ...board, [pos]: feature })
  }

  private drawGrass(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    if (this.drawnSprites.has(key)) return

    const scene = this.worldLayer.scene
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 16
    const img = scene.add.image(wx, wy, k.texture, k.frame)
    this.drawnSprites.set(key, img)
  }

  private drawTree(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    if (this.drawnSprites.has(key)) return

    const scene = this.worldLayer.scene
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 32
    //todo: texture placing failed
    const img = scene.add.image(wx, wy, k.texture, k.frame).setOrigin(0.5, 1)
    this.drawnSprites.set(key, img)
  }

  private drawSign(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    if (this.drawnSprites.has(key)) return

    const scene = this.worldLayer.scene
    const wx = (this.worldLayer.tileToWorldX(col) ?? 0) + 16
    const wy = (this.worldLayer.tileToWorldY(row) ?? 0) + 32
    const img = scene.add.image(wx, wy, k.texture, k.frame).setOrigin(0.5, 1)
    this.drawnSprites.set(key, img)
  }

  private drawTilled(col: number, row: number, k: Tile): void {
    const key = this.posToString(col, row)
    let img = this.drawnSprites.get(key)
    if (!img) {
      const scene = this.belowLayer.scene
      const wx = (this.belowLayer.tileToWorldX(col) ?? 0) + 16
      const wy = (this.belowLayer.tileToWorldY(row) ?? 0) + 32
      img = scene.add.image(wx, wy, k.texture, k.frame).setOrigin(0.5, 1)
      this.drawnSprites.set(key, img)
    }

    if (k.name === 'tilled_dirt' && k.watered) {
      img.setTint(0x6f8fb0)
    } else {
      img.clearTint()
    }
  }

  private posToString(col: number, row: number): string {
    return `${col},${row}`
  }

  private stringToPos(s: string): [number, number] {
    const [col, row] = s.split(',').map(Number)
    return [col, row]
  }

  swingAxe(col: number, row: number) {
    //board -> tree -> remove -> setMap
    this.removeFeature(col, row)
  }
  swingPickaxe(col: number, row: number) {
    this.removeFeature(col, row)
  }

  water(col: number, row: number): void {
    const pos = this.posToString(col, row)
    const board = dataManager.getMap(this.mapKey)
    const feature = board[pos]
    if (feature?.name !== 'tilled_dirt' || feature.watered) return
    const watered: Tile = { ...feature, watered: true }
    dataManager.setMap(this.mapKey, { ...board, [pos]: watered })
  }

  till(col: number, row: number): void {
    this.addFeature(col, row, TEMP_OBJECT_TILES.tilled)
  }

  private doesTileHaveProperty(col: number, row: number, prop: string): unknown {
    return this.belowLayer.getTileAt(col, row)?.properties?.[prop]
  }

  isTileOccupied(col: number, row: number): boolean {
    const key = this.posToString(col, row)
    const features = dataManager.getMap(this.mapKey)[key]
    return features?.isOccupied
  }

  isTilePassable(col: number, row: number): boolean {
    const key = this.posToString(col, row)
    if (this.resourceClumps.has(key)) return true
    if (this.worldLayer.getTileAt(col, row) != null) return true
    const features = dataManager.getMap(this.mapKey)[key]
    return !features?.isOccupied || features?.isPassable
  }

  getTileInfo(col: number, row: number) {
    const diggable = this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.DIGGABLE) === true
    const watersource =
      this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.WATERSOURCE) === true
    const action = this.doesTileHaveProperty(col, row, STATIC_TILE_PROPERTIES.ACTION)
    const features = dataManager.getMap(this.mapKey)[this.posToString(col, row)] ?? null
    return { diggable, features, watersource, action }
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
