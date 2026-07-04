import { Scene, GameObjects } from "phaser";
import { dataManager, BASE_VOLUME } from "../dataManager/Store";
import { options } from "../utils/constants/options";
import { ModalBehavoir } from "phaser4-rex-plugins/plugins/modal.js";
import { MapKeys } from "../utils/constants/mapKeys";

const BTN_WIDTH = 180;
const BTN_HEIGHT = 56;
const BTN_GAP = 48; // ≈ 3em
const BTN_MARGIN_BOTTOM = 90;

export class MainMenu extends Scene {
  title: GameObjects.Text;

  constructor() {
    super("MainMenu");
  }

  create() {
    // todo: update volume event when load() happens.
    this.sound.play("bgm", { loop: true, volume: options.BGM_VOLUME });

    const canvasWidth = this.game.canvas.width;
    const canvasHeight = this.game.canvas.height;

    this.title = this.add
      .text(canvasWidth / 2, 120, "Apocalyptic farming game proto", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    this.buildMenu(canvasWidth, canvasHeight);
  }

  private buildMenu(canvasWidth: number, canvasHeight: number): void {
    const labels = ["New Game", "Continue", "Options"];
    const n = labels.length;
    const rowWidth = n * BTN_WIDTH + (n - 1) * BTN_GAP;
    const startX = (canvasWidth - rowWidth) / 2 + BTN_WIDTH / 2;
    const y = canvasHeight - BTN_MARGIN_BOTTOM;

    const newGameX = startX;
    const continueX = startX + (BTN_WIDTH + BTN_GAP);
    const optionsX = startX + 2 * (BTN_WIDTH + BTN_GAP);

    this.createButton(newGameX, y, "New Game", true, () => this.startNewGame());

    this.createButton(continueX, y, "Continue", dataManager.hasSave(), () => {
      dataManager.load();
      this.scene.start("Game", {
        fromSave: true,
        area: dataManager.getPlayerData().currentMapKey,
      });
    });

    this.createButton(optionsX, y, "Options", true, () =>
      this.openOptionsModal(),
    );
  }

  private openOptionsModal(): void {
    const cx = this.game.canvas.width / 2;
    const cy = this.game.canvas.height / 2;

    const panel = this.add
      .rectangle(0, 0, 420, 300, 0x1e1e1e)
      .setStrokeStyle(2, 0xffffff);
    const heading = this.add
      .text(0, -120, "Options", {
        fontFamily: "Arial Black",
        fontSize: 26,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const bgmLabel = this.add
      .text(-150, 0, "BGM", {
        fontFamily: "Arial",
        fontSize: 22,
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);
    const isOn = () => dataManager.getOption().volume > 0;
    const onColor = 0x2d5a34;
    const offColor = 0x5a2d2d;

    const toggleBg = this.add
      .rectangle(110, 0, 100, 44, isOn() ? onColor : offColor)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({ useHandCursor: true });
    const toggleText = this.add
      .text(110, 0, isOn() ? "ON" : "OFF", {
        fontFamily: "Arial Black",
        fontSize: 20,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    toggleBg.on("pointerdown", () => {
      const nextVolume = isOn() ? 0 : BASE_VOLUME;
      dataManager.setOption({ volume: nextVolume });
      this.sound.setVolume(nextVolume);
      toggleText.setText(isOn() ? "ON" : "OFF");
      toggleBg.setFillStyle(isOn() ? onColor : offColor);
    });

    const dialog = this.add.container(cx, cy, [
      panel,
      heading,
      bgmLabel,
      toggleBg,
      toggleText,
    ]);

    new ModalBehavoir(dialog, {
      cover: { color: 0x000000, alpha: 0.7 },
      touchOutsideClose: true,
      duration: { in: 200, out: 200 },
      transitIn: 1, // fadeIn
      transitOut: 1, // fadeOut
      destroy: true,
    });
  }

  private createButton(
    x: number,
    y: number,
    label: string,
    enabled: boolean,
    onClick: () => void,
  ): GameObjects.Container {
    const bgColor = enabled ? 0x2d5a34 : 0x3a3a3a;
    const textColor = enabled ? "#ffffff" : "#888888";

    const bg = this.add
      .rectangle(0, 0, BTN_WIDTH, BTN_HEIGHT, bgColor)
      .setStrokeStyle(2, 0xffffff, enabled ? 1 : 0.3);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: "Arial Black",
        fontSize: 22,
        color: textColor,
      })
      .setOrigin(0.5);

    const container = this.add.container(x, y, [bg, text]);

    if (enabled) {
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => bg.setFillStyle(0x3f7a49));
      bg.on("pointerout", () => bg.setFillStyle(bgColor));
      bg.on("pointerdown", onClick);
    }

    return container;
  }

  private startNewGame(): void {
    dataManager.reset();
    this.scene.start("Game", { fromSave: false, area: MapKeys.Farm });
  }
}
