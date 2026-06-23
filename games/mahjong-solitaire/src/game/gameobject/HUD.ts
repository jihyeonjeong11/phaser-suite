import { Scene, GameObjects } from "phaser";

export class HUD extends GameObjects.Container {
  private scoreText: GameObjects.Text;
  private movesText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.scene.add.existing(this);

    const style = {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
    };
    this.scoreText = scene.add.text(-200, 0, "", style).setOrigin(0, 0.5);
    this.movesText = scene.add.text(200, 0, "", style).setOrigin(1, 0.5);
    this.add([this.scoreText, this.movesText]);

    this.setScore(0);
    this.setRemovable(0);
  }

  public setScore(removedPairs: number): void {
    this.scoreText.setText(`Pairs removed: ${removedPairs}`);
  }

  public setRemovable(count: number): void {
    this.movesText.setText(`Removable: ${count}`);
  }
}
