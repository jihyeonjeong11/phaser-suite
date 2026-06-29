import { Cameras, GameObjects, Scene, Tilemaps, Types } from "phaser";
import { Player } from "../../../gameobjects/Player";
import { DebugHud } from "../../../gameobjects/DebugHud";
import { Tilemap } from "../../../gameobjects/Tilemap";
import { Portals } from "../../../gameobjects/Portals";

export class Ruin extends Scene {
  camera!: Cameras.Scene2D.Camera;
  map!: Tilemaps.Tilemap;
  player!: Player;
  debugHud!: DebugHud;
  portals: Portals;

  constructor() {
    super("Ruin");
  }

  create() {
    const tilemap = new Tilemap(this, "ruin_map");
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
    ) as Types.Tilemaps.TiledObject;

    const player = new Player(this, spawnPoint.x!, spawnPoint.y!, "player");
    this.player = player;

    if (worldLayer) {
      this.physics.add.collider(player, worldLayer);
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

    this.camera.fadeIn(1000, 0, 0, 0);
  }

  update() {
    this.debugHud.update(this.player, this.map);
  }
}
