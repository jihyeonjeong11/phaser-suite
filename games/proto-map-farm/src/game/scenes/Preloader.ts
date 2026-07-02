import { Scene } from "phaser";
import { TEMP_INV } from "../store/Store";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    // Loading bar (based on gamedevacademy Phaser 3 preloading screen tutorial)
    const { width, height } = this.scale;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    const boxWidth = 320;
    const boxHeight = 50;
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height / 2 - boxHeight / 2;

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(boxX, boxY, boxWidth, boxHeight);

    this.add
      .text(width / 2, boxY - 20, "Loading...", {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const percentText = this.add
      .text(width / 2, boxY + boxHeight / 2, "0%", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const assetText = this.add
      .text(width / 2, boxY + boxHeight + 20, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        boxX + 10,
        boxY + 10,
        (boxWidth - 20) * value,
        boxHeight - 20,
      );
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on("fileprogress", (file: Phaser.Loader.File) => {
      assetText.setText(`Loading asset: ${file.key}`);
    });
  }

  preload() {
    // Start Inventory
    this.registry.set("inventory", TEMP_INV);

    // DEBUG: 파일을 하나씩 순차 로드해 진행 단계를 잘게 관찰

    // Testing tile map sheet from itch.io // todo: draw tilemap!
    this.load.setPath("assets");
    this.load.tilemapTiledJSON("farm-map", "farm-map.json");
    this.load.tilemapTiledJSON("home-map", "home-map.json");
    this.load.tilemapTiledJSON("ruin_map", "ruin_map.json");

    for (let i = 1; i <= 7; i++) {
      this.load.image(`${i}`, `${i}.png`);
    }
    this.load.image(`home1`, `home1.png`);
    this.load.image(`ruin_tile`, `ruin_tile.png`);
    this.load.image(`ruin_structure`, `ruin_structure.png`);
    this.load.image(`ruin_object`, `ruin_object.png`);

    const resources = [
      {
        // Weapon spritesheet (self-drawn). 64x64 per frame — currently 1 frame.
        type: "spritesheet",
        key: "weapons",
        url: "weapons.png",
        frameWidth: 64,
        frameHeight: 64,
      },
      {
        type: "spritesheet",
        key: "tools",
        url: "farming_tools.png",
        frameWidth: 64,
        frameHeight: 16,
      },
      {
        type: "spritesheet",
        key: "base_char",
        url: "base_char.png",
        frameWidth: 16,
        frameHeight: 20,
      },
      {
        type: "spritesheet",
        key: "hairs_char",
        url: "hairs_char.png",
        frameWidth: 16,
        frameHeight: 20,
      },
      { type: "audio", key: "bgm", url: "musics/background.mp3" },
      { type: "audio", key: "gunfire", url: "sounds/gunfire.mp3" },
    ];

    resources.forEach((resource) => {
      if (resource.type === "spritesheet") {
        const r = resource as {
          type: "spritesheet";
          key: string;
          url: string;
          frameWidth: number;
          frameHeight: number;
        };
        this.load.spritesheet(r.key, r.url, {
          frameWidth: r.frameWidth,
          frameHeight: r.frameHeight,
        });
      } else if (resource.type === "audio") {
        this.load.audio(resource.key, resource.url);
      }
    });
  }

  create() {
    this.scene.start("MainMenu");
  }
}
