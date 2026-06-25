import { GameObjects, Scene } from "phaser";

export class Button extends GameObjects.Text {
  private action: () => void = () => {};

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
    this.action = onClick;
    this.setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.setAlpha(0.8))
      .on("pointerout", () => this.setAlpha(1))
      .on("pointerdown", () => this.action());

    scene.add.existing(this);
  }

  setAction(label: string, onClick: () => void): this {
    this.setText(label);
    this.action = onClick;
    return this;
  }

  show(): this {
    return this.setVisible(true).setInteractive({ useHandCursor: true });
  }

  hide(): this {
    return this.setVisible(false).disableInteractive();
  }
}
