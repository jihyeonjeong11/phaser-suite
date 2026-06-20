import { CARD_VALUES, ICard, SUITS } from "../../utils/types";

export class Deck {
  cards: ICard[];

  constructor() {
    this.reset();
  }

  public getCards(): ICard[] {
    return this.cards;
  }

  public reset(): void {
    this.cards = SUITS.flatMap((suit) =>
      CARD_VALUES.map(({ value, symbol }) => ({ suit, value, symbol })),
    );
    this.shuffle();
  }

  public shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public draw(): ICard | undefined {
    return this.cards.pop();
  }

  public deal(n: number): ICard[] {
    const hand: ICard[] = [];
    for (let i = 0; i < n && this.cards.length > 0; i++) {
      hand.push(this.cards.pop()!);
    }
    return hand;
  }

  public get count(): number {
    return this.cards.length;
  }
}
