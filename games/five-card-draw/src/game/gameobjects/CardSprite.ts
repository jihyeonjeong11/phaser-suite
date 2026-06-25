import { GameObjects, Scene } from "phaser";
import { ICard } from "../utils/types";
import { getCardFrameKey } from "../utils/helpers";

export class CardSprite extends GameObjects.Sprite {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "cardBg", "back");
  }

  setFace(card: ICard) {
    this.setTexture("cardSprite", getCardFrameKey(card));
  }

  moveTo(x: number, y: number, delay: number, onArrive: () => void) {
    return this.scene.tweens.add({
      targets: this,
      x,
      y,
      duration: 400,
      delay,
      ease: "Cubic.easeOut",
      onComplete: onArrive,
    });
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
