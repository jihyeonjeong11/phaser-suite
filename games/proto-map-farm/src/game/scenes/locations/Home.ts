import { Cameras, GameObjects, Scene, Tilemaps, Types } from "phaser";
import { Player } from "../../../gameobjects/Player";
import { DebugHud } from "../../../gameobjects/DebugHud";
import { Tilemap } from "../../../gameobjects/Tilemap";
import { NPC } from "../../../gameobjects/NPC";
import { Portals } from "../../../gameobjects/Portals";

export class Home extends Scene {
  camera!: Cameras.Scene2D.Camera;
  map!: Tilemaps.Tilemap;
  player!: Player;
  debugHud!: DebugHud;
  portals: Portals;

  constructor() {
    super("Home");
  }

  create() {
    const tilemap = new Tilemap(this, "home-map");
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

    this.camera.fadeIn(1000, 0, 0, 0);
  }

  update() {
    console.log(this.registry.get("inventory"));
    this.debugHud.update(this.player, this.map);
  }
}
