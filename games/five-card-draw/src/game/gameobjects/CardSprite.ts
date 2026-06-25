import { GameObjects, Scene } from "phaser";
import { ICard } from "../utils/types";
import { getCardFrameKey } from "../utils/helpers";

export class CardSprite extends GameObjects.Sprite {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "cardBg", "back");
  }

  // 애니메이션 없이 즉시 앞면으로 세팅
  setFace(card: ICard) {
    this.setTexture("cardSprite", getCardFrameKey(card));
  }

  flipTo(card: ICard) {
    return this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 150,
      ease: "Cubic.easeIn",
      yoyo: true,
      onYoyo: () => this.setTexture("cardSprite", getCardFrameKey(card)),
    });
  }
}
