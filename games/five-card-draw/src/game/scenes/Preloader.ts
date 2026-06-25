import { Scene } from "phaser";
import { CARD_VALUES, SUITS } from "../utils/constants";
import { getCardFrameKey } from "../utils/helpers";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // //  We loaded this image in our Boot Scene, so we can display it here
    // this.add.image(512, 384, "background");
    // //  A simple progress bar. This is the outline of the bar.
    // this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    // //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    // const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);
    // //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    // this.load.on("progress", (progress: number) => {
    //   //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
    //   bar.width = 4 + 460 * progress;
    // });
  }

  preload() {
    //  Load the assets for the game - Replace with your own assets
    this.load.setPath("assets");
    this.load.spritesheet("cardSprite", "./cards.png", {
      frameWidth: 48,
      frameHeight: 64,
    });
    this.load.image("logo", "logo.png");
    this.load.image("cardBg", "./card-bg.png");
  }

  create() {
    this.textures.get("cardBg").add("back", 0, 48, 71, 51, 73);

    const CARD_W = 48;
    const CARD_H = 64;
    const tex = this.textures.get("cardSprite");
    SUITS.forEach((suit, row) => {
      for (const { value } of CARD_VALUES) {
        tex.add(
          getCardFrameKey({ suit, value }),
          0,
          (value - 1) * CARD_W,
          row * CARD_H,
          CARD_W,
          CARD_H,
        );
      }
    });

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("Game");
  }
}
