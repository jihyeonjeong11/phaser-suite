import { Cameras, GameObjects, Scene } from "phaser";
import { InventoryItem, TEMP_INV_LIMIT } from "../../game/store/Store";

export class QuickBar extends GameObjects.Container {
  private static readonly SLOT_SIZE = 44;
  private static readonly GAP = 4;
  private static readonly MARGIN_BOTTOM = 12;

  private slots: GameObjects.Rectangle[] = [];
  private icons: (GameObjects.Image | null)[] = [];

  constructor(scene: Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(1000);

    this.build();
    this.render();

    const reg = scene.registry;
    reg.events.on("changedata-inventory", this.render, this);
    reg.events.on("changedata-quickbarSelected", this.render, this);

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

  private render(): void {
    const inv = (this.scene.registry.get("inventory") ?? []) as InventoryItem[];
    const selected = this.scene.registry.get("quickbarSelected") ?? -1;

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
        .setScrollFactor(0)
        .setScale(3);

      this.add(icon);
      this.icons[i] = icon;
    }
  }

  private cleanup(): void {
    const reg = this.scene.registry;
    reg.events.off("changedata-inventory", this.render, this);
    reg.events.off("changedata-quickbarSelected", this.render, this);
  }
}
