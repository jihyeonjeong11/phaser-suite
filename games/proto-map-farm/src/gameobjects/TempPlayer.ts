import { GameObjects, Scene, Tilemaps, Types } from "phaser";
import { Controls } from "../game/utils/controls";
import { dataManager } from "../game/dataManager/Store";

export class TempPlayer {
  charSprite: GameObjects.Sprite;
  _controls: Controls;
  _worldLayer: Tilemaps.TilemapLayer;
  _portalLayer: Tilemaps.ObjectLayer | null;
  private onEnterPortal: (dest: string) => void;
  protected readonly baseScale: number = 3;
  // todo: compute actual speed for Player class
  protected readonly baseSpeed: number = 1.5;
  constructor(
    scene: Scene,
    startPos: { x: number; y: number },
    _controls: Controls,
    collisionLayer: Tilemaps.TilemapLayer,
    portalLayer: Tilemaps.ObjectLayer | null,
    onEnterPortal: (dest: string) => void,
  ) {
    this._controls = _controls;
    this._worldLayer = collisionLayer;
    this._portalLayer = portalLayer;
    this.onEnterPortal = onEnterPortal;
    // 시작 위치는 Game이 결정(로드=저장 좌표 / 그 외=맵 스폰포인트)해서 주입.
    dataManager.setPlayerData({ x: startPos.x, y: startPos.y });
    this.charSprite = scene.add.sprite(
      startPos.x,
      startPos.y,
      "base_char",
      0,
    );

    // setscale
    this.charSprite.setScale(this.baseScale);
    const key = this.charSprite.texture.key;
    this.charSprite.anims.create({
      key: `${key}-idle`,
      frames: this.charSprite.anims.generateFrameNumbers(key, {
        frames: [0, 1],
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.charSprite.anims.create({
      key: `${key}-walk`,
      frames: this.charSprite.anims.generateFrameNumbers(key, {
        frames: [2, 3],
      }),
      frameRate: 3,
      repeat: -1,
    });

    this.charSprite.play(`${key}-idle`);

    // 이동
    // 포탈 이동
    // hand
    // 무기
    // 총알
    // 툴
  }

  private doesPositionCollideWithWorldLayer(position: {
    x: number;
    y: number;
  }): boolean {
    if (!this._worldLayer) {
      return false;
    }

    const { x, y } = position;
    const tile = this._worldLayer.getTileAtWorldXY(x, y, true);
    if (!tile) {
      return false;
    }
    return tile.index !== -1;
  }

  // 맵 밖(void) 이탈 방지. 바디가 없어 setCollideWorldBounds 대신 수동 검사.
  private isWithinBounds(position: { x: number; y: number }): boolean {
    const map = this._worldLayer.tilemap;
    const { x, y } = position;
    return (
      x >= 0 && y >= 0 && x <= map.widthInPixels && y <= map.heightInPixels
    );
  }

  private getPortalAt(position: {
    x: number;
    y: number;
  }): Types.Tilemaps.TiledObject | null {
    if (!this._portalLayer) return null;
    const map = this._worldLayer.tilemap;
    const tw = map.tileWidth;
    const th = map.tileHeight;
    const col = Math.floor(position.x / tw);
    const row = Math.floor(position.y / th);
    return (
      this._portalLayer.objects.find((obj) => {
        if (obj.x == null || obj.y == null) return false;
        return Math.floor(obj.x / tw) === col && Math.floor(obj.y / th) === row;
      }) ?? null
    );
  }

  update() {
    if (this._controls.isInputLocked) return;

    // 방향, 전환 // 전환은 마우스로 하는거 아님? 총 들었을때는 마우스로 해야하고(뒤로가면서 사격하게) 아닐떄는 아닌데, 지금은 복잡하니까 마우스는 빼고 여기서 돌릭 ㅔ하자.
    // 이동
    const key = this.charSprite.texture.key;
    const dir = this._controls.getDirectionKeyPressedDown();

    const dx = dir === "LEFT" ? -1 : dir === "RIGHT" ? 1 : 0;
    const dy = dir === "UP" ? -1 : dir === "DOWN" ? 1 : 0;

    if (dir === "LEFT") this.charSprite.setFlipX(true);
    else if (dir === "RIGHT") this.charSprite.setFlipX(false);

    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      const targetPos = {
        x: this.charSprite.x + dx * this.baseSpeed,
        y: this.charSprite.y + dy * this.baseSpeed,
      };

      if (
        !this.doesPositionCollideWithWorldLayer(targetPos) &&
        this.isWithinBounds(targetPos)
      ) {
        this.charSprite.setPosition(targetPos.x, targetPos.y);
        dataManager.setPlayerData({ x: targetPos.x, y: targetPos.y });

        const portal = this.getPortalAt(targetPos);
        if (portal) {
          const dest = portal.properties?.find(
            (p: { name: string; value: unknown }) => p.name === "dest",
          )?.value;
          // 검출은 여기(위치를 앎), 전환은 씬에 위임 (SRP/DIP)
          if (typeof dest === "string") this.onEnterPortal(dest);
        }
      }
    }

    // 애니 (움직임 여부로 idle/walk)
    this.charSprite.play(`${key}-${moving ? "walk" : "idle"}`, true);
  }
}
