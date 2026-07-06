import { Scene, Tilemaps } from "phaser";
import { MAP_KEYS, MapKey } from "../../../game/utils/constants/mapKeys";

export class Features {
  private scene: Scene;
  private worldLayer: Tilemaps.TilemapLayer;
  private resourceClumps: Set<string>;

  private static readonly TREE_FOOTPRINT: [number, number][] = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ];

  constructor(
    mapKey: MapKey,
    worldLayer: Tilemaps.TilemapLayer,
    resourceClumps: Set<string>,
  ) {
    this.worldLayer = worldLayer;
    this.scene = worldLayer.scene;
    this.resourceClumps = resourceClumps;

    switch (mapKey) {
      case MAP_KEYS.CLIFF: {
        // heart of waste with tree animated sprite
        this.spawnArtifactTree();
        break;
      }
      case MAP_KEYS.FARM:
      case MAP_KEYS.RUIN:
        // tbd
        break;
    }
  }

  private spawnArtifactTree(): void {
    const HEART_TREE_ANCHOR_GID = 1377;

    if (!this.scene.anims.exists("heart_pulse")) {
      this.scene.anims.create({
        key: "heart_pulse",
        frames: this.scene.anims.generateFrameNumbers("heart_anim", {
          start: 0,
          end: 2,
        }),
        frameRate: 4,
        repeat: -1,
        repeatDelay: 1500,
      });
    }

    this.worldLayer.forEachTile((tile) => {
      if (tile.index !== HEART_TREE_ANCHOR_GID) return;

      for (const [dcol, drow] of Features.TREE_FOOTPRINT) {
        this.markOccupied(tile.x + dcol, tile.y + drow);
      }

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

  private markOccupied(col: number, row: number): void {
    this.resourceClumps.add(`${col},${row}`);
  }
}
