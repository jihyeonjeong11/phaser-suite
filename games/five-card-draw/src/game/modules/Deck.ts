import { CARD_VALUES } from "../utils/constants";
import { ICard, SUITS } from "../utils/types";

// Phaser없는 내부 로직만
export class Deck {
  public startDeck(): ICard[] {
    return SUITS.flatMap((suit) =>
      CARD_VALUES.map(({ value, symbol }) => ({ suit, value, symbol })),
    );
  }
  public shuffle(cards: ICard[]): ICard[] {
    const result = [...cards];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
