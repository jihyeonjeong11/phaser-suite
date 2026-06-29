import { Scene, Display } from "phaser";

export class DebugHud {
  private coordsText: Phaser.GameObjects.Text;
  private collisionGraphics: Phaser.GameObjects.Graphics;

  constructor(
    scene: Scene,
    worldLayer?:
      | Phaser.Tilemaps.TilemapLayer
      | Phaser.Tilemaps.TilemapGPULayer
      | null,
  ) {
    this.collisionGraphics = scene.add
      .graphics()
      .setAlpha(0.75)
      .setVisible(false);
    worldLayer?.renderDebug(this.collisionGraphics, {
      tileColor: null,
      collidingTileColor: new Display.Color(243, 134, 48, 255),
      faceColor: new Display.Color(40, 39, 37, 255),
    });

    scene.add
      .text(
        8,
        8,
        [
          "Arrow keys: move player",
          "C: toggle collides overlay",
          "P: toggle portal zones",
        ].join("\n"),
        {
          fontSize: "14px",
          color: "#ffffff",
          backgroundColor: "#000000",
          padding: { x: 8, y: 6 },
        },
      )
      .setScrollFactor(0)
      .setDepth(30);

    this.coordsText = scene.add
      .text(8, 56, "", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 8, y: 6 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    scene.input.keyboard!.on("keydown-C", () => {
      this.collisionGraphics.setVisible(!this.collisionGraphics.visible);
    });
  }

  update(
    target: Phaser.GameObjects.Sprite,
    map: Phaser.Tilemaps.Tilemap,
  ): void {
    const tx = Math.floor(target.x / map.tileWidth);
    const ty = Math.floor(target.y / map.tileHeight);
    this.coordsText.setText(
      `x: ${Math.round(target.x)}  y: ${Math.round(target.y)}\ntile: ${tx}, ${ty}`,
    );
  }
}
