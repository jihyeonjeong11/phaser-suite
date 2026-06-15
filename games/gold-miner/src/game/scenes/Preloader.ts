import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    const { width, height } = this.scale;
    this.add
      .image(width / 2, height / 2, "background")
      .setDisplaySize(width, height);
    this.add.image(width / 2, height * 0.35, "logo");
    this.add
      .rectangle(width / 2, height * 0.72, 468, 32)
      .setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(
      width / 2 - 230,
      height * 0.72,
      4,
      28,
      0xffffff,
    );
    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    this.load.setPath("assets");

    this.load.image("miner", "miner.png");
    this.load.image("hook", "hook.png");
    this.load.image("gold", "gold_chunk.png");
    this.load.image("gold2", "gold_chunk2.png");
    this.load.image("rock", "rock.png");
    this.load.image("bag", "bag.png");
    this.load.spritesheet("diamond", "diamonds32x5.png", {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.audio("rope_creaking", "sounds/rope_creaking.mp3");
    this.load.audio("hook_catch", "sounds/hook_catch.mp3");
    this.load.audio("collect", "sounds/collect.mp3");
  }

  create() {
    this.scene.start("MainMenu");
  }
}
