import { Scene, Tilemaps, Types } from "phaser";
import { MapObject } from "./mapObjects/MapObjects";
import { MapKey } from "../game/utils/constants/mapKeys";

function imageKeyFor(source: string): string {
  const base = source.split(/[\\/]/).pop() ?? source;
  return base.replace(/\.[^.]+$/, "");
}
export class Worldmap {
  readonly map: Tilemaps.Tilemap;
  // todo: need intractable tile for farming
  // Optional: only some maps have it. Drawn behind everything, used as a
  // collision source for void areas outside the walkable ground.
  readonly backgroundLayer: Tilemaps.TilemapLayer | null;
  readonly belowLayer: Tilemaps.TilemapLayer;
  readonly worldLayer: Tilemaps.TilemapLayer;
  readonly aboveLayer: Tilemaps.TilemapLayer;

  readonly spawnPoint: Types.Tilemaps.TiledObject;
  readonly portalLayer: Tilemaps.ObjectLayer | null;

  mapObjects: MapObject;

  constructor(scene: Scene, key: MapKey) {
    this.map = scene.make.tilemap({ key });

    const tilesets = this.resolveTilesets(scene, key);

    // Created first + depth -10 so it renders behind Below/World/Above.
    // (Phaser depth follows creation order; Tiled's layer order is not read.)
    this.backgroundLayer = this.map.getLayer("Background")
      ? (this.map.createLayer(
          "Background",
          tilesets,
          0,
          0,
          false,
        ) as Tilemaps.TilemapLayer)
      : null;
    this.backgroundLayer?.setDepth(-10);

    this.belowLayer = this.map.createLayer(
      "Below Player",
      tilesets,
      0,
      0,
      false,
    ) as Tilemaps.TilemapLayer;
    this.worldLayer = this.map.createLayer(
      "World",
      tilesets,
      0,
      0,
      false,
    ) as Tilemaps.TilemapLayer;
    this.aboveLayer = this.map.createLayer(
      "Above Player",
      tilesets,
      0,
      0,
      false,
    ) as Tilemaps.TilemapLayer;

    // consider: should i need different spawn points? maybe
    this.spawnPoint = this.map.findObject(
      "Objects",
      (obj) => obj.name === "Spawn Point",
    ) as Phaser.Types.Tilemaps.TiledObject;

    if (!this.spawnPoint) {
      throw new Error("Worldmap should have at least one spawn point.");
    }

    this.portalLayer = this.map.getObjectLayer("Portals");

    this.mapObjects = new MapObject(
      this.belowLayer,
      this.getWorldLayer(),
      key as MapKey,
    );

    this.addMapCollision(scene);
  }

  getSpawnPoint(): Types.Tilemaps.TiledObject {
    return this.spawnPoint;
  }

  getMap(): Tilemaps.Tilemap {
    return this.map;
  }

  getWorldLayer() {
    return this.worldLayer;
  }

  getBackgroundLayer() {
    return this.backgroundLayer;
  }

  getPortalLayer() {
    return this.portalLayer;
  }

  private addMapCollision(scene: Scene) {
    this.worldLayer?.setCollisionByExclusion([-1]);
    this.backgroundLayer?.setCollisionByExclusion([-1]);

    scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
  }

  // todo: need to draw real tileset
  private resolveTilesets(
    scene: Scene,
    key: string,
  ): Phaser.Tilemaps.Tileset[] {
    const raw =
      (scene.cache.tilemap.get(key)?.data?.tilesets as
        | { name: string; image?: string }[]
        | undefined) ?? [];
    return raw
      .map((t) => {
        const imgKey = t.image ? imageKeyFor(t.image) : undefined;
        return imgKey ? this.map.addTilesetImage(t.name, imgKey) : null;
      })
      .filter((ts): ts is Phaser.Tilemaps.Tileset => ts !== null);
  }
}
