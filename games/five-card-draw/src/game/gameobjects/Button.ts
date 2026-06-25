import { GameObjects, Scene } from "phaser";

export class Button extends GameObjects.Text {
  constructor(
    scene: Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ) {
    super(scene, x, y, label, {
      fontSize: "24px",
      color: "#fff",
      backgroundColor: "#2a6",
      padding: { x: 16, y: 8 },
    });
    this.setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.setAlpha(0.8))
      .on("pointerout", () => this.setAlpha(1))
      .on("pointerdown", onClick);

    scene.add.existing(this);
  }
}
