import { GameObjects, Math as PMath, Scene } from "phaser";
import { CARD_SCALE } from "../utils/constants";

export class ShuffleDeck extends GameObjects.Container {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    for (let i = 0; i < 3; i++) {
      this.add(scene.add.sprite(0, 0, "cardBg", "back").setScale(CARD_SCALE));
    }
    scene.add.existing(this);
  }

  shuffleAnimation(onDone: () => void): void {
    this.scene.tweens.add({
      targets: this.list,
      x: { getEnd: () => PMath.Between(-10, 10) },
      y: { getEnd: () => PMath.Between(-8, 8) },
      duration: 100,
      yoyo: true,
      repeat: 4,
      ease: "Power1",
      onComplete: () => {
        this.list.forEach((c) => (c as GameObjects.Sprite).setPosition(0, 0));
        onDone();
      },
    });
  }
}
