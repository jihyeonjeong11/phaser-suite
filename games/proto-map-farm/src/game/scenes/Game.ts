import { Scene, Display } from "phaser";

//  Maps a tileset image source (e.g. "6.png", "../foo/3.png") to the image key
//  loaded in Preloader ("tiles1".."tiles7"). Returns undefined for anything
//  that doesn't follow the "<n>.png" naming so we can skip it safely.

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

function imageKeyFor(source: string): string | undefined {
  const base = source.split(/[\\/]/).pop() ?? source;
  const match = base.match(/(\d+)\.png$/i);
  return match ? `tiles${match[1]}` : undefined;
}

const PLAYER_SPEED = 150;

export class Game extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  map!: Phaser.Tilemaps.Tilemap;
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  coordsText!: Phaser.GameObjects.Text;
  facing: "down" | "up" | "left" | "right" = "down";

  constructor() {
    super("Game");
  }

  create() {
    const map = this.make.tilemap({ key: "farm-map" });
    this.map = map;

    //  Read the raw tileset list straight from the map data so the name -> image
    //  mapping adapts automatically whenever the map is re-exported from Tiled.
    const rawTilesets =
      (this.cache.tilemap.get("farm-map")?.data?.tilesets as
        | { name: string; image?: string }[]
        | undefined) ?? [];

    const tilesets = rawTilesets
      .map((raw) => {
        const key = raw.image ? imageKeyFor(raw.image) : undefined;
        return key ? map.addTilesetImage(raw.name, key) : null;
      })
      .filter((ts): ts is Phaser.Tilemaps.Tileset => ts !== null);

    map.createLayer("Below Player", tilesets, 0, 0);
    const worldLayer = map.createLayer("World", tilesets, 0, 0);
    map.createLayer("Above Player", tilesets, 0, 0);

    worldLayer?.setCollisionByProperty({ collides: true });

    //  Debug overlay: highlight which tiles actually collide. Hidden by default;
    //  toggled with the C key (see below).
    const debugGraphics = this.add.graphics().setAlpha(0.75).setVisible(false);
    worldLayer?.renderDebug(debugGraphics, {
      tileColor: null, // Color of non-colliding tiles
      collidingTileColor: new Display.Color(243, 134, 48, 255), // Color of colliding tiles
      faceColor: new Display.Color(40, 39, 37, 255), // Color of colliding face edges
    });

    //  Top-left help/HUD, pinned to the camera (does not scroll with the map).
    this.add
      .text(
        8,
        8,
        ["Arrow keys: move player", "C: toggle collides overlay"].join("\n"),
        {
          fontSize: "14px",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 8, y: 6 },
        },
      )
      .setScrollFactor(0)
      .setDepth(30);

    //  Live player coordinate read-out, just below the help text.
    this.coordsText = this.add
      .text(8, 56, "", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    //  C toggles the collision debug overlay on/off.
    this.input.keyboard!.on("keydown-C", () => {
      debugGraphics.setVisible(!debugGraphics.visible);
    });

    //  Confine the player to the whole map. Without this the physics world
    //  defaults to the canvas size (1024x768), trapping the player in that box.
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const spawnPoint = map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point",
    ) as Phaser.Types.Tilemaps.TiledObject;
    const player = this.physics.add.sprite(
      spawnPoint.x!,
      spawnPoint.y!,
      "player",
      "down-1",
    );
    //  Scale up so the player roughly fills a tile. Integer scale keeps the
    //  pixel art crisp (config has pixelArt: true).
    player.setScale(2);
    //  Collision body sits at the feet, not the whole 18x26 sprite. setSize is
    //  in source pixels; it scales with the sprite, so the foot box scales too.
    // player.body.setSize(12, 8).setOffset(3, 16);
    player.setCollideWorldBounds(true);
    if (worldLayer) {
      this.physics.add.collider(player, worldLayer);
    }
    this.player = player;

    //  Walk cycles. "side" faces left in the sheet; right is the same frames
    //  mirrored with flipX at runtime.
    const walk = (key: string, prefix: string) =>
      this.anims.create({
        key,
        frames: this.anims.generateFrameNames("player", {
          prefix,
          start: 0,
          end: 2,
        }),
        frameRate: 8,
        repeat: -1,
      });
    walk("walk-down", "down-");
    walk("walk-up", "up-");
    walk("walk-side", "left-");

    //  Arrow keys drive the player.
    this.cursors = this.input.keyboard!.createCursorKeys();

    //  Camera: follow the player, clamped to the map bounds.
    this.camera = this.cameras.main;
    this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.camera.setBackgroundColor("#1d2b1f");
    this.camera.startFollow(player);
  }

  update() {
    const player = this.player;
    const body = player.body as Phaser.Physics.Arcade.Body;
    const cursors = this.cursors;

    //  Reset velocity from the previous frame, then apply input.
    body.setVelocity(0);

    if (cursors.left.isDown) {
      body.setVelocityX(-PLAYER_SPEED);
    } else if (cursors.right.isDown) {
      body.setVelocityX(PLAYER_SPEED);
    }

    if (cursors.up.isDown) {
      body.setVelocityY(-PLAYER_SPEED);
    } else if (cursors.down.isDown) {
      body.setVelocityY(PLAYER_SPEED);
    }

    //  Normalize so diagonal movement isn't faster than straight movement.
    body.velocity.normalize().scale(PLAYER_SPEED);

    //  Update the HUD read-out: world position and the tile it sits on.
    const tx = Math.floor(player.x / this.map.tileWidth);
    const ty = Math.floor(player.y / this.map.tileHeight);
    this.coordsText.setText(
      `x: ${Math.round(player.x)}  y: ${Math.round(player.y)}\ntile: ${tx}, ${ty}`,
    );

    //  Pick the animation from the dominant input direction. Left/right reuse
    //  the same "side" frames, mirrored for right.
    if (cursors.left.isDown) {
      this.facing = "left";
      player.setFlipX(false);
      player.anims.play("walk-side", true);
    } else if (cursors.right.isDown) {
      this.facing = "right";
      player.setFlipX(true);
      player.anims.play("walk-side", true);
    } else if (cursors.up.isDown) {
      this.facing = "up";
      player.anims.play("walk-up", true);
    } else if (cursors.down.isDown) {
      this.facing = "down";
      player.anims.play("walk-down", true);
    } else {
      //  Idle: stop walking and rest on the middle (standing) frame.
      player.anims.stop();
      const idle = this.facing === "right" ? "left" : this.facing;
      player.setFrame(`${idle}-1`);
    }
  }
}
