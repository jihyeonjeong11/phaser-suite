import { ICard } from "../utils/types";

export class Hand {
  private held: ICard[];
  private constructor(private cards: ICard[]) {
    this.held = [];
  }

  static create(): Hand {
    return new Hand([]);
  }

  public fillHand(cards: ICard[]): void {
    this.cards = cards;
  }

  get current(): ICard[] {
    return [...this.cards];
  }

  get getHelds() {
    return this.held;
  }

  set setHeld(arr: ICard[]) {
    this.held = arr;
  }
}
