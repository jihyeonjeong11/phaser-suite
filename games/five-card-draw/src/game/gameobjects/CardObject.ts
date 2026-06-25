import { GameObjects, Scene } from "phaser";
import { ICard } from "../utils/types";
import { CardSprite } from "./CardSprite";
import { CARD_SCALE } from "../utils/constants";

export interface HandLayout {
  deck: { x: number; y: number };
  anchor: { x: number; y: number };
  gap: number;
}

export class CardObject extends GameObjects.Container {
  private static readonly STAGGER = 120;

  private slots: (CardSprite | null)[] = [];

  constructor(
    scene: Scene,
    private layout: HandLayout,
  ) {
    super(scene, 0, 0);
    scene.add.existing(this);
  }

  public clear(): void {
    this.scene.tweens.killTweensOf(this.list);
    this.removeAll(true);
    this.slots = [];
  }

  public dealTo(i: number, card: ICard, onDone: () => void): void {
    const sprite = new CardSprite(
      this.scene,
      this.layout.deck.x,
      this.layout.deck.y,
    ).setScale(CARD_SCALE);
    this.add(sprite);
    this.slots[i] = sprite;

    sprite.moveTo(
      this.layout.anchor.x + i * this.layout.gap,
      this.layout.anchor.y,
      i * CardObject.STAGGER,
      () => {
        sprite.flipTo(card);
        onDone();
      },
    );
  }

  public replaceAt(i: number, card: ICard, onDone: () => void): void {
    this.slots[i]?.destroy();
    this.slots[i] = null;
    this.dealTo(i, card, onDone);
  }

  public setHeld(i: number, held: boolean): void {
    const sprite = this.slots[i];
    if (!sprite) return;
    held ? sprite.setTint(0x888888) : sprite.clearTint();
  }
}
