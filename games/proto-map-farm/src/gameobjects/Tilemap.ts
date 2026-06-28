import { Scene, Tilemaps } from "phaser";

function imageKeyFor(source: string): string | undefined {
  const base = source.split(/[\\/]/).pop() ?? source;
  const match = base.match(/(\d+)\.png$/i);
  return match ? `tiles${match[1]}` : undefined;
}

export class Tilemap {
  readonly map: Tilemaps.Tilemap;
  readonly worldLayer: Tilemaps.TilemapLayer | Tilemaps.TilemapGPULayer;

  constructor(scene: Scene, key: string) {
    this.map = scene.make.tilemap({ key });

    const tilesets = this.resolveTilesets(scene, key);
    this.map.createLayer("Below Player", tilesets, 0, 0);
    this.worldLayer = this.map.createLayer("World", tilesets, 0, 0);
    this.map.createLayer("Above Player", tilesets, 0, 0);
    this.worldLayer?.setCollisionByProperty({ collides: true });

    scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
  }

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

  findSpawn(name = "Spawn Point"): Phaser.Types.Tilemaps.TiledObject {
    return this.map.findObject(
      "Objects",
      (o) => o.name === name,
    ) as Phaser.Types.Tilemaps.TiledObject;
  }
}
