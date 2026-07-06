import { Cameras, GameObjects, Scene } from "phaser";
import { dataManager, TEMP_INV_LIMIT } from "../../game/dataManager/Store";

export class QuickBar extends GameObjects.Container {
  private static readonly SLOT_SIZE = 44;
  private static readonly GAP = 4;
  private static readonly MARGIN_BOTTOM = 12;
  private static readonly ICON_PADDING = 8;

  private slots: GameObjects.Rectangle[] = [];
  private icons: (GameObjects.Image | null)[] = [];

  constructor(scene: Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1000);

    this.build();
    // 데이터는 커스텀 dataManager(자체 EventEmitter)에 쓰이므로 여기에 리스너를 건다.
    // 키가 "currentSelectedIdx" → 이벤트명은 changedata-currentSelectedIdx.

    // todo: EventEmitter로 가기
    dataManager.on("changedata-inventory", this.render, this);
    dataManager.on("changedata-currentSelectedIdx", this.render, this);

    this.buildSaveButton();
    this.render();

    scene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_START, () =>
      this.cleanup(),
    );
  }

  private build(): void {
    const { SLOT_SIZE, GAP, MARGIN_BOTTOM } = QuickBar;
    const n = TEMP_INV_LIMIT;
    const barWidth = n * SLOT_SIZE + (n - 1) * GAP;
    const startX = (this.scene.scale.width - barWidth) / 2 + SLOT_SIZE / 2;
    const y = this.scene.scale.height - SLOT_SIZE / 2 - MARGIN_BOTTOM;

    for (let i = 0; i < n; i++) {
      const x = startX + i * (SLOT_SIZE + GAP);

      const slot = this.scene.add
        .rectangle(x, y, SLOT_SIZE, SLOT_SIZE, 0x000000, 0.5)
        .setStrokeStyle(2, 0x888888)
        .setScrollFactor(0);

      const label = this.scene.add
        .text(
          x - SLOT_SIZE / 2 + 4,
          y - SLOT_SIZE / 2 + 2,
          String((i + 1) % 10),
          { fontSize: "10px", color: "#cccccc" },
        )
        .setScrollFactor(0);

      this.add([slot, label]);
      this.slots.push(slot);
      this.icons.push(null);
    }
  }

  // 퀵바 오른쪽에 테스트용 세이브 버튼 (클릭 시 localStorage 저장)
  private buildSaveButton(): void {
    const { SLOT_SIZE, GAP, MARGIN_BOTTOM } = QuickBar;
    const n = TEMP_INV_LIMIT;
    const barWidth = n * SLOT_SIZE + (n - 1) * GAP;
    const barRight = (this.scene.scale.width + barWidth) / 2;
    const btnWidth = SLOT_SIZE * 1.4;
    const x = barRight + GAP + btnWidth / 2;
    const y = this.scene.scale.height - SLOT_SIZE / 2 - MARGIN_BOTTOM;

    const btn = this.scene.add
      .rectangle(x, y, btnWidth, SLOT_SIZE, 0x225522, 0.8)
      .setStrokeStyle(2, 0x66cc66)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    const label = this.scene.add
      .text(x, y, "SAVE", {
        fontSize: "14px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    btn.on("pointerover", () => btn.setFillStyle(0x338833, 0.9));
    btn.on("pointerout", () => btn.setFillStyle(0x225522, 0.8));
    btn.on("pointerdown", () => {
      dataManager.save();
      label.setText("SAVED");
      this.scene.time.delayedCall(800, () => label.setText("SAVE"));
    });

    this.add([btn, label]);
  }

  private render(): void {
    const inv = dataManager.getInventory();
    const selected = dataManager.getCurrentSelectedIdx();

    for (let i = 0; i < this.slots.length; i++) {
      const isSelected = i === selected;
      this.slots[i].setStrokeStyle(
        isSelected ? 3 : 2,
        isSelected ? 0xffd700 : 0x888888,
      );

      this.icons[i]?.destroy();
      this.icons[i] = null;

      const item = inv[i];
      if (!item) continue;

      const slot = this.slots[i];
      const icon = this.scene.add
        .image(slot.x, slot.y, item.textureKey, item.frame)
        .setScrollFactor(0);

      this.add(icon);
      this.icons[i] = icon;
    }
  }

  private cleanup(): void {
    dataManager.off("changedata-inventory", this.render, this);
    dataManager.off("changedata-currentSelectedIdx", this.render, this);
  }
}
