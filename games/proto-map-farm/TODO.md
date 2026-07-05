# TODO

> excalidraw 설계 기준. 파일 박스별 책임 + 남은 작업.
> 목표 구조: `Constants` / `game/map/Tilemap.ts` / `Game.ts`(배선) / `gameobjects/mapObjects/MapObjects.ts`

## future todo

- [x] 포탈 전환: `Portals`(오브젝트 레이어 zone) 플레이어 -> 이동 -> worldmap에 어떤 타일인지 화깅ㄴ -> portal이면 이동
- [x] `new Player(worldLayer 넘겨줌)` = 플레이어가 충돌 소유 → collider 배선을 Player 쪽으로
- [] 8방향 컨트롤
- [] 오브젝트 레이어(plowables, tree and else)

## 이미 된 것 (현재 코드 상태)

- [x] Home/Ruin 씬 삭제 → `Game` 하나 + `area` 파라미터로 통합 (Game.ts `sceneData.area`)
- [x] Tilemap.ts: json 렌더(Below/World/Above) + 타일셋 해석(`resolveTilesets`/`imageKeyFor`) + `findSpawn`
- [x] 포탈 오브젝트 레이어(zone) 읽어 overlap 전환 동작 (Portals.ts) — 이 방식 유지

## 0. Constants (tile key)

- [ ] `tiled-keys.ts` 만들고 매직 스트링 몰기: 타일 레이어명("Below Player"/"World"/"Above Player"), 오브젝트 레이어명("Objects"/"Portals"), 타일 프로퍼티명("collides"), 오브젝트 프로퍼티명("dest"/"trigger"), 오브젝트명("Spawn Point") - 만약 키를 worldmap에서만 소비한다면 지금 할 필요 없음.
  - ⚠️ Tiled의 per-tile 커스텀 프로퍼티는 타일셋의 **타일 종류**에 붙어 모든 인스턴스 공유 → `collides`(벽 공통)엔 OK, 포탈 `dest`처럼 배치별 값은 불가.
  - 그래서 포탈/스폰은 **오브젝트 레이어**(오브젝트별 프로퍼티)로 관리. `isPortal`(타일 프로퍼티) 아이디어는 폐기.
  - 현재 constants.ts엔 `DIRECTION`만 있음. 나머지는 코드에 하드코딩 상태

- [x] tile key(맵 key) 상수화 — `constants/mapKeys.ts` (`MapKeys.Farm`/`DEFAULT_MAP_KEY`). Preloader/Game/Store/MainMenu 통일 → "Farm" vs "farm-map" 불일치(fromSave 깨짐) 해소

## 1. Tilemap.ts → `gameobjects/Worldmap`으로 이동

역할 확정 = **json 렌더 + collides 지오메트리 + 오브젝트/스폰/포탈 레이어 조회**까지만

- [x] 충돌 지오메트리 중복 제거: `Worldmap.addMapCollision()` 한 곳에만 (`setCollisionByExclusion([-1])` 사용 — property 대신 exclusion으로 확정)
- [x] `physics.world.setBounds` 중복 제거: `Worldmap.addMapCollision()`에만. Game은 `camera.setBounds`(카메라 경계, 별개)
- [x] `getObjectLayer` 래퍼로 노출: `getWorldLayer()`/`getPortalLayer()`/`getMap()`/`getSpawnPoint()`. Game이 `map` 직접 안 파고듦
- [x] `findSpawn` 노출 (완료)
- ~~isPortal(타일 프로퍼티) 도입~~ — 폐기. 포탈은 오브젝트 레이어 zone으로 관리(Portals.ts).

## 2. Game.ts (배선만)

- [ ] `new MapObjects` (나중에)
- [ ] `new ResourceGenerator` (나중에, 다른 파일)

- 아래 내용은 모두 game.ts에서 늘어놓고 다음에 진행

#### v1까지

## 3. mapObjects/MapObjects.ts (나중)

- [ ] MapObjects.ts 채우기 — 현재 **빈 파일**(1줄)
- [ ] object 레이어 읽어서 타입별 엔티티 생성 + 그룹으로 수집
- [ ] 포탈 엔티티 `trigger` 속성 분기
  - auto → 즉시 전환
  - interact → 키 눌러야 전환 (외부↔내부 문)
- [ ] interact 포탈 프롬프트 UI ("SPACE로 들어가기") — 나중에
- [ ] 기존 `gameobjects/Portals.ts`(zone+overlap)를 MapObjects 스포너로 흡수/이동 (삭제 아님 — 방식 유지)

## 4. 자원 (나중)

- [ ] Harvestable 엔티티 (풀 / 나무 / 폐허)
- [ ] ResourceGenerator (별도 파일): 재성장·리스폰. 시간 + 저장(dataManager) 기반. 맵은 "어디 자랄 수 있나" 제약만 제공

## 잡 정리

- [ ] `public/assets/home-map.json`, `ruin_map.json` — 통합 후 남은 파일. 미사용이면 제거

## 메모

- 이동은 속도 직접 세팅 유지. 가속도 시스템 X. 필요하면 걷기/달리기 속도 "상태"만 (관성 아님)
- 대시/넉백 생기면 그때 일회성 임펄스로, 이동 코드 안 건드림
- 포탈 방식: **오브젝트 레이어 zone + overlap 유지**. Tiled per-tile 프로퍼티는 배치별 값(dest)을 못 담아 isPortal/resolve 아이디어 폐기.
