import { Scene, Tilemaps } from "phaser";
import { MAP_KEYS, MapKey } from "../../../game/utils/constants/mapKeys";

// todo: new AnimatedSprite
const HEART_TREE_ANCHOR_GID = 1480;
// todo: new Furniture
const BED_ANCHOR_GID = 126; // 차양(위) 타일. 카운터는 146.

export class StaticFeatures {
  private scene: Scene;
  private worldLayer: Tilemaps.TilemapLayer;

  constructor(
    mapKey: MapKey,
    worldLayer: Tilemaps.TilemapLayer,
    resourceClumps: Set<string>,
  ) {
    this.worldLayer = worldLayer;
    this.scene = worldLayer.scene;

    switch (mapKey) {
      case MAP_KEYS.CLIFF: {
        // heart of waste with tree animated sprite
        this.spawnArtifactTree();
        break;
      }
      case MAP_KEYS.HOME:
        // 가구 침대. // 잠자기
        this.worldLayer.forEachTile((tile) => {
          if (tile.index !== BED_ANCHOR_GID) return;
          tile.properties.action = "sleep";
        });
        break;
      case MAP_KEYS.FARM:
      case MAP_KEYS.RUIN:
        // tbd
        break;
    }
  }

  private spawnArtifactTree(): void {
    if (!this.scene.anims.exists("heart_pulse")) {
      this.scene.anims.create({
        key: "heart_pulse",
        frames: this.scene.anims.generateFrameNumbers("heart_anim", {
          frames: [0, 1, 2, 1, 0],
        }),
        frameRate: 4,
        repeat: -1,
        repeatDelay: 1500,
      });
    }
    this.worldLayer.forEachTile((tile) => {
      if (tile.index !== HEART_TREE_ANCHOR_GID) return;

      const tree = this.scene.add
        .sprite(
          tile.pixelX + tile.width,
          tile.pixelY + tile.height * 2,
          "heart_anim",
        )
        .setOrigin(0.5, 1);
      tree.setDepth(tree.y);
      tree.play("heart_pulse");
    });
  }
}
