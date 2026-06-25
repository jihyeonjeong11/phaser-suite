import { Scene, GameObjects } from "phaser";

export class HUD extends GameObjects.Container {
  private betText: GameObjects.Text;
  private moneyText: GameObjects.Text;
  private resultText: GameObjects.Text;

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const style = {
      fontFamily: "Arial",
      fontSize: "24px",
      color: "#ffffff",
    };
    this.betText = scene.add.text(20, 15, "Current bet: 0", style);
    this.moneyText = scene.add.text(300, 15, "Current money: 0", style);
    this.resultText = scene.add.text(640, 15, "", style);
    this.add([this.betText, this.moneyText, this.resultText]);
  }

  setBet(n: number): void {
    this.betText.setText(`Current bet: ${n}`);
  }

  setMoney(n: number): void {
    this.moneyText.setText(`Current money: ${n}`);
  }

  setResult(label: string): void {
    this.resultText.setText(label);
  }
}
