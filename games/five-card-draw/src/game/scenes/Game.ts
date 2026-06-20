import { Scene } from "phaser";
import { Deck } from "../gameobjects/Deck";
import { Hand } from "../gameobjects/Hand";

//SOLID
// 여기서는 클래스 시작과 draw update 렌더만을 다룸

// base logic
// 1. Create deck
// 2. Shuffle
// 3. Handout to player
// 4. console.log for random cards

// base draw
// 1. preload card sprites
// 2. create complete deck
// 3. draw

export class Game extends Scene {
  deck!: Deck;
  hand!: Hand;

  constructor() {
    super("Game");
  }

  init() {
    this.deck = new Deck();
  }

  create() {
    const { centerX, height } = this.cameras.main;

    // Game이 컨트롤러로서 Deck에서 5장을 받아 Hand에 지급하고 중앙 하단에 올린다
    this.hand = new Hand(this, this.deck.deal(5));
    this.hand.setPosition(centerX - 2 * 70, height - 120);
    this.add.existing(this.hand);
  }
}
