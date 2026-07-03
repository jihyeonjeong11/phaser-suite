import { Physics, Scene, Tilemaps } from "phaser";

export class Portals {
  portals: Physics.Arcade.StaticGroup;

  constructor(scene: Scene, map: Tilemaps.Tilemap) {
    this.portals = scene.physics.add.staticGroup();

    const tw = map.tileWidth;
    const th = map.tileHeight;

    const portalLayer = map.getObjectLayer("Portals");
    if (portalLayer) {
      portalLayer.objects.forEach((obj) => {
        if (obj.x == null || obj.y == null) return;
        const col = Math.floor(obj.x / tw);
        const row = Math.floor(obj.y / th);
        const portal = scene.add.zone(
          col * tw + tw / 2,
          row * th + th / 2,
          tw,
          th,
        );
        scene.physics.add.existing(portal, true);

        obj.properties?.forEach((p: { name: string; value: string }) =>
          portal.setData(p.name, p.value),
        );

        this.portals.add(portal);
      });
    }
  }

  get getPortals(): Physics.Arcade.StaticGroup {
    return this.portals;
  }
}
