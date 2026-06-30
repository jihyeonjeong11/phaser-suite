import { Cameras, GameObjects, Scene, Tilemaps } from "phaser";
import { Player } from "../../gameobjects/Player";
import { DebugHud } from "../../gameobjects/DebugHud";
import { NPC } from "../../gameobjects/NPC";
import { Tilemap } from "../../gameobjects/Tilemap";
import { Portals } from "../../gameobjects/Portals";
import { Inventory } from "../farmgame/Inventory";

// 1. 맵 / 레벨 구성

// 1. 타일맵 생성 — this.make.tilemap({ key: "farm-map" })
// 2. 타일셋 해석 — 캐시에서 raw 타일셋 목록 읽기, 이미지 소스→키 매핑(imageKeyFor), addTilesetImage
// 3. 레이어 렌더 — Below Player / World / Above Player 생성 및 순서 관리
// 4. 충돌 데이터 설정 — World 레이어 setCollisionByProperty({ collides: true })

// cleanup for scailing : gameobjects/map 을 통해 공통 규칙 생성, FarmMap.ts, HouseMap.ts 등을 통해 실제 타일 렌더

// 2. 플레이어

// 5. 스폰 지점 조회 — Objects 레이어에서 Spawn Point 찾기
// 6. 플레이어 스프라이트 생성 — 위치/프레임/스케일
// 7. 물리 바디 설정 — 발 충돌박스(setSize/setOffset, 현재 주석), setCollideWorldBounds
// 8. 플레이어 ↔ 월드 충돌 연결 — physics.add.collider
// 9. 애니메이션 정의 — walk-down / walk-up / walk-side 생성
// 10. 이동 처리 (update) — 입력→속도, 대각선 정규화
// 11. 애니메이션 상태머신 (update) — 방향(facing)·flip·idle 프레임 결정

// cleanup for scailing : farmgame/entitiy.ts 를 통해 공통 규칙(여기서는 페이싱만), gameobjects/ player, monster, plant 등을 통해 렌더

// 3. 카메라

// 12. 카메라 경계(setBounds) + 배경색
// 13. 플레이어 추적(startFollow)
// 14. 물리 월드 경계(physics.world.setBounds) — 카메라는 아니지만 "맵 범위" 책임

// cleanup for scailing : gameobjects/camera.ts를 통해 로직 분리(추가 로직이 필요할지? 혹시 모르니 분리)

// 4. 입력

// 15. 커서 키 생성 — createCursorKeys
// 16. 디버그 토글 키(C) 바인딩

// cleanup for scailing : gameobjects/controls.ts를 통해 로직 분리(추가 로직: 액션 키 등)

// 5. UI / 디버그 (HUD)

// 17. 헬프 텍스트 패널
// 18. 좌표 읽기 텍스트 생성 + 매 프레임 갱신(update)
// 19. 충돌 디버그 오버레이 — graphics + renderDebug + 표시 토글

// // cleanup for scailing : gameobjects/debugHUD.ts를 통해 로직 분리(추가 로직: 액션 키 등) 추후에 인벤토리 등 실제 hud.ts가 생성되어야 함.

// 6. 모듈 레벨

// 20. imageKeyFor — 타일셋 파일명→로드 키 변환 헬퍼 // map.ts에 두기,
// 21. PLAYER_SPEED 상수 - entity에 두기.

export class Game extends Scene {
  camera!: Cameras.Scene2D.Camera;
  map!: Tilemaps.Tilemap;
  player!: Player;
  debugHud!: DebugHud;
  portals: Portals;

  constructor() {
    super("Game");
  }

  create() {
    this.registry.set("inventory", ["testing"]);
    const tilemap = new Tilemap(this, "farm-map");
    this.map = tilemap.map;
    const worldLayer = tilemap.worldLayer;

    worldLayer?.setCollisionByProperty({ collides: true });

    this.debugHud = new DebugHud(this, worldLayer);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );

    const spawnPoint = this.map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point",
    ) as Phaser.Types.Tilemaps.TiledObject;

    const player = new Player(this, spawnPoint.x!, spawnPoint.y!, "hero");
    this.player = player;

    const npc = new NPC(this, spawnPoint.x! + 20, spawnPoint.y!, "npc");

    this.physics.add.collider(player, npc);

    if (worldLayer) {
      this.physics.add.collider(player, worldLayer);
      this.physics.add.collider(npc, worldLayer);
    }

    const bullets = player.getBullets();
    if (bullets && worldLayer) {
      this.physics.add.collider(bullets, worldLayer, (bullet) =>
        (bullet as GameObjects.GameObject).destroy(),
      );
    }

    this.camera = this.cameras.main;
    this.camera.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    this.camera.setBackgroundColor("#1d2b1f");
    this.camera.startFollow(player);

    this.portals = new Portals(this, this.map);

    let isTransitioning = false;

    this.physics.add.overlap(
      this.player,
      this.portals.getPortals,
      (_player, portal) => {
        if (isTransitioning) return;
        isTransitioning = true;

        const dest = (portal as GameObjects.Zone).getData("dest");

        this.physics.world.disable(this.player);
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
          this.scene.start(dest),
        );
      },
      undefined,
      this,
    );

    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  update() {
    this.registry.get("inventory");
    this.debugHud.update(this.player, this.map);
  }
}
