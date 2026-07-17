# Better graphics

- godot tutorial에서 타일셋 베낄만한거 많음

# Aesthetics

- fallout 과 하베스트문 공존 가능?
- 픽셀로 만들기 가능?

# TODO

> excalidraw 설계 기준. 파일 박스별 책임 + 남은 작업.
> 목표 구조: `Constants` / `game/map/Tilemap.ts` / `Game.ts`(배선) / `gameobjects/mapObjects/MapObjects.ts` / Character -> Player, NPC, Enemy?

# HUD

- 베이스 모달 x-padding, y-padding 이외 채우기
- 인벤토리 모달?
- 메뉴?

# Inv models

- TEMP_ITEMS constants

# Character

- 슈펔클래스
- player
- npc
- enemy

> 설계 노트는 `gameobjects/characters/Character.ts` 상단 주석 참고

# Tools

- character > tools

# Farm-Rules

- 시간
- 날씨
-

## future todo

- [x] 포탈 전환: `Portals`(오브젝트 레이어 zone) 플레이어 -> 이동 -> worldmap에 어떤 타일인지 화깅ㄴ -> portal이면 이동
- [x] `new Player(worldLayer 넘겨줌)` = 플레이어가 충돌 소유 → collider 배선을 Player 쪽으로
- [x] 8방향 컨트롤
- [x] 오브젝트 레이어(plowables, tree and else)

## Tilemap.ts → `gameobjects/Worldmap`으로 이동

역할 확정 = **json 렌더 + collides 지오메트리 + 오브젝트/스폰/포탈 레이어 조회**까지만

- [x] 충돌 지오메트리 중복 제거: `Worldmap.addMapCollision()` 한 곳에만 (`setCollisionByExclusion([-1])` 사용 — property 대신 exclusion으로 확정)
- [x] `physics.world.setBounds` 중복 제거: `Worldmap.addMapCollision()`에만. Game은 `camera.setBounds`(카메라 경계, 별개)
- [x] `getObjectLayer` 래퍼로 노출: `getWorldLayer()`/`getPortalLayer()`/`getMap()`/`getSpawnPoint()`. Game이 `map` 직접 안 파고듦
- [x] `findSpawn` 노출 (완료)
- ~~isPortal(타일 프로퍼티) 도입~~ — 폐기. 포탈은 오브젝트 레이어 zone으로 관리(Portals.ts).

## Game.ts

- [x] `new MapObjects` (나중에)

#### v1까지

## mapObjects

- [ ] Crops entity.
- [ ] Harvestable 엔티티 (풀 / 나무 / 폐허 / ) - crop.ts 이후로 더 로직이 필요해질 경우 추가함
- [ ] ResourceGenerator class

## mapObjects/MapObjects.ts (나중)

- [ ] 포탈 엔티티 `trigger` 속성 분기
  - auto → 즉시 전환
  - interact → 키 눌러야 전환 (외부↔내부 문)
- [ ] interact 포탈 프롬프트 UI ("SPACE로 들어가기") — 나중에
- [ ] 기존 `gameobjects/Portals.ts`(zone+overlap)를 MapObjects 스포너로 흡수/이동 (삭제 아님 — 방식 유지)

## 이미 된 것 (현재 코드 상태)

- [x] Home/Ruin 씬 삭제 → `Game` 하나 + `area` 파라미터로 통합 (Game.ts `sceneData.area`)
- [x] Tilemap.ts: json 렌더(Below/World/Above) + 타일셋 해석(`resolveTilesets`/`imageKeyFor`) + `findSpawn`
- [x] 포탈 오브젝트 레이어(zone) 읽어 overlap 전환 동작 (Portals.ts) — 이 방식 유지

- [x] tile key(맵 key) 상수화 — `constants/mapKeys.ts` (`MapKeys.Farm`/`DEFAULT_MAP_KEY`). Preloader/Game/Store/MainMenu 통일 → "Farm" vs "farm-map" 불일치(fromSave 깨짐) 해소
