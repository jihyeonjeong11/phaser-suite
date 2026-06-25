import { CARD_VALUES, SUITS } from "../utils/constants";
import { ICard } from "../utils/types";

export class Deck {
  private constructor(private cards: ICard[]) {}
  static create(): Deck {
    const cards = Deck.shuffle(Deck.buildDeck());
    return new Deck(cards);
  }

  private static buildDeck(): ICard[] {
    return SUITS.flatMap((suit) =>
      CARD_VALUES.map(({ value, symbol }) => ({ suit, value, symbol })),
    );
  }

  private static shuffle<T>(arr: T[]): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  public dealCard() {
    const card = this.cards.shift();
    if (!card) throw new Error("deck is empty");
    return card;
  }
}
