import { GameObjects, Scene } from "phaser";
import { ICard } from "../utils/types";
import { cardFrame } from "../utils/sprite";

// 순수 뷰 한 장. 뒷면("back")으로 태어나고, 자기 자신을 뒤집어 앞면을 공개할 줄 안다.
export class CardSprite extends GameObjects.Sprite {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "cardBg", "back"); // 뒷면으로 시작
  }

  // 뒤집기: scaleX를 0으로 좁혔다가(절반) 텍스처를 앞면으로 갈고 다시 펼친다.
  // onYoyo가 폭이 0인 순간(턴 지점)에 호출되어 교체가 안 보이게 숨겨진다.
  flipTo(card: ICard) {
    return this.scene.tweens.add({
      targets: this,
      scaleX: 0,
      duration: 150,
      ease: "Cubic.easeIn",
      yoyo: true,
      onYoyo: () => this.setTexture("cardSprite", cardFrame(card)),
    });
  }
}
