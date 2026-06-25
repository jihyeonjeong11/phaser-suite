import { GameObjects, Scene } from "phaser";
import { ICard } from "../utils/types";
import { CardSprite } from "./CardSprite";
import { Button } from "./Button";
import { CARD_SCALE } from "../utils/constants";

export interface HandLayout {
  deck: { x: number; y: number };
  anchor: { x: number; y: number };
  gap: number; // 슬롯 간격
}

export class CardObject extends GameObjects.Container {
  private static readonly STAGGER = 120;

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
  }

  public dealTo(i: number, card: ICard, onDone: () => void): void {
    const sprite = new CardSprite(
      this.scene,
      this.layout.deck.x,
      this.layout.deck.y,
    ).setScale(CARD_SCALE);
    this.add(sprite);

    this.scene.tweens.add({
      targets: sprite,
      x: this.layout.anchor.x + i * this.layout.gap,
      y: this.layout.anchor.y,
      duration: 400,
      delay: i * CardObject.STAGGER,
      ease: "Cubic.easeOut",
      onComplete: () => {
        sprite.flipTo(card);
        onDone();
      },
    });
    // new Button(
    //   this.scene,
    //   this.layout.anchor.x + i * this.layout.gap,
    //   this.layout.anchor.y,
    //   "hold",
    //   () => console.log(i, "clicked"),
    // );
  }
}
