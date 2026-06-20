import { GameObjects, Scene } from "phaser";
import { ICard } from "../../utils/types";
import { cardFrame } from "../../utils/cardFrame";
import { Card } from "./Card";

// SOT 소유 + 시각 컨테이너.
// cards/held가 진실(같은 인덱스), sprites는 그 진실을 그리는 뷰.
export class Hand extends GameObjects.Container {
  private static readonly GAP = 70;

  cards: ICard[]; // SOT: 받은 카드
  held: boolean[]; // SOT: 잡힘 여부 (cards와 같은 인덱스)
  private sprites: Card[]; // 뷰 (cards와 같은 인덱스)

  constructor(scene: Scene, cards: ICard[]) {
    super(scene, 0, 0);
    this.cards = cards;
    this.held = cards.map(() => false);
    this.sprites = cards.map((card, i) => {
      const sprite = new Card(scene, i * Hand.GAP, 0, cardFrame(card)).setScale(
        1.5,
      );
      // 입력은 상태를 소유한 Hand가 배선한다 (Card는 순수 드로잉 유지)
      sprite.setInteractive();
      sprite.on("pointerdown", () => this.toggleHold(i));
      this.add(sprite);
      return sprite;
    });
  }

  // 잡힘 토글: SOT를 바꾸고, 해당 카드에 표시만 지시
  toggleHold(i: number): void {
    this.held[i] = !this.held[i];
    this.sprites[i].setHeld(this.held[i]);
  }

  // 잡은 카드 / 안 잡은 카드 (SOT에서 파생)
  get heldCards(): ICard[] {
    return this.cards.filter((_, i) => this.held[i]);
  }
}
