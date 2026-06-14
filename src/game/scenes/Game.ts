import { Scene } from "phaser";
import { Hook } from "../gameobjects/hook";

export class Game extends Scene {
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;
  hook: Hook;

  constructor() {
    super("Game");
  }
  /**
   * This renders the whole game screen.
   */
  create() {
    this.add.image(512, 384, "background").setDisplaySize(1024, 768);
    this.renderHUD();
    this.renderMiningHook();
    this.input.once("pointerdown", () => {
      this.scene.start("GameOver");
    });
  }

  /*
    Render the mining hook.
  */
  private renderMiningHook(): void {
    this.hook = new Hook(this, 512, 85);
  }

  /**
   * This renders a miner.
   */
  private renderMiner() {
    this.add.image(512, 47, "miner").setDisplaySize(64, 64);
  }
  /**
   * This renders a HUD panel. TODO: needs react or customized plugin for future hud area.
   */
  private renderHUD() {
    const hud = this.add.rectangle(0, 0, 1024, 120, 0xffff00).setOrigin(0, 0);
    this.add.existing(hud);
    this.renderMiner();
  }
}
