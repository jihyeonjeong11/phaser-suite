# Better graphics

- godot tutorial에서 타일셋 베낄만한거 많음

# GDD 작성

- https://github.com/cristianCeamatu/js-phaser-shooter-game/blob/development/gdd/Official_GDD.pdf

# Aesthetics

- fallout 과 하베스트문 공존 가능?
- 픽셀로 만들기 가능? -> itch io 픽셀 있으니까, 이거 가져와서 내가 그리면 안되나?

# pixel arts

- itch io에 사놓은거 보고 내가 따라 그릴 것.(사이즈 ldp 3232)

# TODO

> excalidraw 설계 기준. 파일 박스별 책임 + 남은 작업.
> 목표 구조: `Constants` / `game/map/Tilemap.ts` / `Game.ts`(배선) / `gameobjects/mapObjects/MapObjects.ts` / Character -> Player, NPC, Enemy? -> 해결

# GameState Pause - 진행 뒤 모달

# 모달 인터페이스(MODAL)

- basemodal
- 모달 사이즈
- modal manager
- pause 필요함.(interactable 시)

# Data Pipeline 하고 save로 넘어가야 함

- 어떻게 할것인지? 스타듀에서는 어떻게 하는지?
- 조금 더 확인해볼 것. 지금 구조도 현재로써는 괜찮을 것으로 보임. 스타듀에서는 클래스에서 저장함.
- 플레이어 위치는 휘발성 값. 현재 phaser sprite에서 참조함.

# Save

- 생각해보면, 하베스트 문 및 스타듀 밸리는 잠잘때 advanceday에서 저장되잖아? 그래서 맵 key는 받을 필요가 없는데, 이건 고민이 필요함
- 그리고, 지금 데이터 저장소가 나눠져 있는것도 고민해야 함. 스토어(맵오브젝트, 인벤), 플레이어데이터(플레이어 클래스)
- 맵 key
- 플레이어 데이터
- 인벤토리
- 맵오브젝트
- 저장 파이프라인 > 저장 버튼 > 위 데이터 store에 저장 > localStorage에 저장
- 시나리오1: 로드 버튼 > locaStorage에 저장된 데이터 serialize > store에 저장 > 각 필요한 클래스로 전달
- 시나리오2: 뉴 버튼 > 데이터 있건 없건 초기 상태

# HUD

- 베이스 모달
- 특화 모달. 스테이터스, 시간 정보, 퀵바, 인벤토리, 옵션 등등
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

# 아이템 습득 및 사용 인터페이스

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
