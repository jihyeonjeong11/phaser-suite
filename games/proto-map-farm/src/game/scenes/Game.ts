import { Cameras } from 'phaser'
import { DebugHud } from '../../gameobjects/hud/DebugHud'
import { BaseScene } from './Base'
import { dataManager } from '../managers/Store'
import { Worldmap } from '../../gameobjects/Worldmap'
import { QuickBar } from '../../gameobjects/hud/QuickBar'
import { DEFAULT_MAP_KEY, MAP_KEYS, MapKey } from '../utils/constants/mapKeys'
import { TempPlayer } from '../../gameobjects/TempPlayer'
import { MapObject } from '../../gameobjects/mapObjects/MapObjects'
import { stopAllSfx } from '../utils/audios'
import { Player } from '../../gameobjects/characters/Player'
import { WorldPos } from '../utils/constants/constants'

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

export class Game extends BaseScene {
  private camera: Cameras.Scene2D.Camera
  private worldMap: Worldmap
  private debugHud: DebugHud
  private sceneData: { area: MapKey; fromSave: boolean } = {
    area: DEFAULT_MAP_KEY,
    fromSave: false
  }
  private tempPlayer: TempPlayer
  private player: Player
  private transitioning = false
  private quickBar: QuickBar
  private mapObject: MapObject

  constructor() {
    super({ key: 'Game' })
  }

  init(data: { area?: MapKey; fromSave?: boolean } = {}) {
    super.init({})
    this.sceneData = {
      area: data.area ?? DEFAULT_MAP_KEY,
      fromSave: data.fromSave ?? false
    }
  }

  create() {
    super.create()
    this.transitioning = false
    this.worldMap = new Worldmap(this, this.sceneData.area)

    this.debugHud = new DebugHud(
      this,
      this.mapObject,
      this.worldMap.getWorldLayer(),
      this.worldMap.getPortalLayer()
    )
    this.quickBar = new QuickBar(this)

    if (this.sceneData.area === MAP_KEYS.CLIFF) {
      //this.spawnCliffTrees();
    }

    dataManager.setPlayerData({ currentMapKey: this.sceneData.area })

    const map = this.worldMap.getMap()
    this.camera = this.cameras.main
    this.camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels)

    const startPos = this.sceneData.fromSave ? this.getSavedPosition() : this.getSpawnPosition()

    this.player = new Player(
      this,
      startPos,
      'base_char',
      this.worldMap.getPortalLayer(),
      (dest) => this.enterPortal(dest)
    )
    this.camera.startFollow(this.player.charSprite)

    // this.tempPlayer = new TempPlayer(
    //   this,
    //   startPos,
    //   this._controls,
    //   this.worldMap.getWorldLayer(),
    //   this.worldMap.getBackgroundLayer(),
    //   this.worldMap.getPortalLayer(),
    //   (dest) => this.enterPortal(dest),
    //   this.worldMap.mapObjects
    // )
  }

  private getSavedPosition(): WorldPos {
    const { x, y } = dataManager.getPlayerData()
    return { x, y }
  }

  private getSpawnPosition(): WorldPos {
    const spawn = this.worldMap.getSpawnPoint()
    if (spawn.x == null || spawn.y == null) {
      throw new Error('No spawn point in worldmap')
    }
    return { x: spawn.x, y: spawn.y }
  }

  private enterPortal(dest: string): void {
    if (this.transitioning) return
    this.transitioning = true
    this._controls.lockInput = true
    stopAllSfx(this)
    this.camera.fadeOut(500, 0, 0, 0)
    this.camera.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Game', { area: dest })
    })
  }

  update() {
    //  this.tempPlayer.update()
    // reconciler // todo:
    // this.quickBar.update()
    const numberKey = this._controls.wasNumberKeyPressed()
    if (numberKey > -1) {
      dataManager.setCurrentSelectedIdx(numberKey)
    }

    const directionKey = this._controls.getDirectionKeyPressed()
    if (directionKey) this.player.moveCharacter(directionKey)

    //  this.debugHud.update(this.tempPlayer.charSprite, this.worldMap.getMap())
  }

  //   const bullets = player.getBullets();
  //   if (bullets && worldLayer) {
  //     this.physics.add.collider(bullets, worldLayer, (bullet) =>
  //       (bullet as GameObjects.GameObject).destroy(),
  //     );
  //   }

  //   this.portals = new Portals(this, this.map);

  //   this.physics.add.overlap(
  //     this.player,
  //     this.portals.getPortals,
  //     (_player, portal) => {
  //       this.handlePortalEnteredCallback(portal as GameObjects.Zone);
  //     },
  //     undefined,
  //     this,
  //   );

  //   this.scene.run("hud");
  //   theatre.emit("hudFocus");
  // }

  // handlePortalEnteredCallback(portal: GameObjects.Zone) {
  //   this._controls.lockInput = true;
  //   this.cameras.main.fadeOut(
  //     1000,
  //     0,
  //     0,
  //     0,
  //     (_camera: Cameras.Scene2D.Camera, progress: number) => {
  //       this.physics.world.disable(this.player);
  //       if (progress === 1) {
  //         const dataToPass = {
  //           area: portal.getData("dest"),
  //         };
  //         this.scene.start("Game", dataToPass);
  //       }
  //     },
  //   );
  // }

  // update() {
  //   this.debugHud.update(this.player, this.map);
  // }
}
