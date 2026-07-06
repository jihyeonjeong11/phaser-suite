import { GameObjects, Scene, Tilemaps, Types } from "phaser";
import { Controls } from "../game/utils/controls";
import { dataManager } from "../game/dataManager/Store";
import { MapObject } from "./mapObjects/MapObjects";
import { playSound } from "../game/utils/audios";
import { AUDIO_KEYS } from "../game/utils/constants/audioKeys";

export class TempPlayer {
  charSprite: GameObjects.Sprite;
  scene: Scene;
  _controls: Controls;
  _worldLayer: Tilemaps.TilemapLayer;
  _backgroundLayer: Tilemaps.TilemapLayer | null;
  _portalLayer: Tilemaps.ObjectLayer | null;
  private onEnterPortal: (dest: string) => void;
  private mapObject: MapObject;
  private targetHighlight?: GameObjects.Rectangle;
  protected readonly baseScale: number = 3;
  // todo: compute actual speed for Player class
  protected readonly baseSpeed: number = 1.5;
  constructor(
    scene: Scene,
    startPos: { x: number; y: number },
    _controls: Controls,
    collisionLayer: Tilemaps.TilemapLayer,
    backgroundLayer: Tilemaps.TilemapLayer | null,
    portalLayer: Tilemaps.ObjectLayer | null,
    onEnterPortal: (dest: string) => void,
    mapObject: MapObject,
  ) {
    this.scene = scene;
    this._controls = _controls;
    this._worldLayer = collisionLayer;
    this._backgroundLayer = backgroundLayer;
    this._portalLayer = portalLayer;
    this.onEnterPortal = onEnterPortal;
    this.mapObject = mapObject;
    dataManager.setPlayerData({ x: startPos.x, y: startPos.y });
    this.charSprite = scene.add.sprite(startPos.x, startPos.y, "base_char", 0);

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

  private doesPositionCollideWithBackgroundLayer(position: {
    x: number;
    y: number;
  }): boolean {
    if (!this._backgroundLayer) {
      return false;
    }

    const { x, y } = position;
    const tile = this._backgroundLayer.getTileAtWorldXY(x, y, true);
    if (!tile) {
      return false;
    }
    return tile.index !== -1;
  }

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

  private updateTargetTile(): void {
    const map = this._worldLayer.tilemap;
    const tw = map.tileWidth;
    const th = map.tileHeight;

    const { x, y, direction } = dataManager.getPlayerData();
    const dx = direction === "LEFT" ? -1 : direction === "RIGHT" ? 1 : 0;
    const dy = direction === "UP" ? -1 : direction === "DOWN" ? 1 : 0;

    const col = Math.floor(x / tw) + dx;
    const row = Math.floor(y / th) + dy;
    const px = col * tw + tw / 2;
    const py = row * th + th / 2;

    const info = this.mapObject.getTileInfo(col, row);
    // 실제 갈 수 있을 때만 초록. diggable(정적)이어도 점유(텐트 등)면 빨강 — makeHoeDirt 조건과 일치.
    const interactable = info.diggable && !info.isOccupied;
    const color = interactable ? 0x00ff00 : 0xff0000;

    if (!this.targetHighlight) {
      this.targetHighlight = this.charSprite.scene.add
        .rectangle(px, py, tw, th, color, 0.25)
        .setStrokeStyle(2, color, 0.9)
        .setDepth(5);
    } else {
      this.targetHighlight
        .setPosition(px, py)
        .setFillStyle(color, 0.25)
        .setStrokeStyle(2, color, 0.9);
    }
  }

  private useTool(): void {
    const map = this._worldLayer.tilemap;
    const tw = map.tileWidth;
    const th = map.tileHeight;

    const { x, y, direction } = dataManager.getPlayerData();
    const dx = direction === "LEFT" ? -1 : direction === "RIGHT" ? 1 : 0;
    const dy = direction === "UP" ? -1 : direction === "DOWN" ? 1 : 0;
    const col = Math.floor(x / tw) + dx;
    const row = Math.floor(y / th) + dy;

    const info = this.mapObject.getTileInfo(col, row);
    // console.log(`useTool → tile (${col}, ${row})`, info);

    // todo: need swing sound
    if (info.feature?.kind === "grass") {
      // 풀이 있는 칸 → 논리 보드에서 제거(리렌더가 스프라이트 파괴)
      playSound(this.scene, AUDIO_KEYS.PICKAXE_HIT);
      this.mapObject.removeFeature(col, row);
    } else if (info.diggable && !info.isOccupied) {
      playSound(this.scene, AUDIO_KEYS.PICKAXE_HIT);

      // this.mapObject.makeHoeDirt(col, row);
    }
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

    if (dir !== "NONE") {
      dataManager.setPlayerData({ direction: dir });
    }

    const moving = dx !== 0 || dy !== 0;
    if (moving) {
      const targetPos = {
        x: this.charSprite.x + dx * this.baseSpeed,
        y: this.charSprite.y + dy * this.baseSpeed,
      };

      if (
        !this.doesPositionCollideWithWorldLayer(targetPos) &&
        !this.doesPositionCollideWithBackgroundLayer(targetPos) &&
        this.isWithinBounds(targetPos)
      ) {
        this.charSprite.setPosition(targetPos.x, targetPos.y);
        dataManager.setPlayerData({ x: targetPos.x, y: targetPos.y });

        const portal = this.getPortalAt(targetPos);
        if (portal) {
          const dest = portal.properties?.find(
            (p: { name: string; value: unknown }) => p.name === "dest",
          )?.value;
          if (typeof dest === "string") this.onEnterPortal(dest);
        }
      }
    }

    this.updateTargetTile();
    if (this._controls.wasCKeyPressed()) this.useTool();
    this.charSprite.play(`${key}-${moving ? "walk" : "idle"}`, true);
  }
}
