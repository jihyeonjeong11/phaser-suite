import { ICard } from "../utils/types";
import { Deck } from "./Deck";
import { Hand } from "./Hand";
import { evaluateHand, Hands } from "./PokerRules";

export class PokerGame {
  deck = Deck.create();
  hand = Hand.create();

  public reset(): void {
    this.deck = Deck.create();
    this.hand = Hand.create();
  }

  public draw(count = 5): ICard[] {
    const cards = Array.from({ length: count }, () => this.deck.dealCard());
    this.hand.fillHand(cards);
    return cards;
  }

  get getCards(): ICard[] {
    return this.hand.current;
  }

  get getHeldCards(): ICard[] {
    return this.hand.getHelds;
  }

  public heldCard(c: ICard): void {
    const prev = this.hand.getHelds;
    if (
      prev.filter(
        (prevCard) => prevCard.suit === c.suit && prevCard.value === c.value,
      ).length
    ) {
      this.hand.setHeld = prev.filter(
        (prevCard) => prevCard.suit !== c.suit || prevCard.value !== c.value,
      );

      return;
    }
    this.hand.setHeld = [...prev, c];
  }

  public redraw(): ICard[] {
    const held = this.hand.getHelds;
    const isHeld = (c: ICard) =>
      held.some((h) => h.suit === c.suit && h.value === c.value);
    const next = this.hand.current.map((c) =>
      isHeld(c) ? c : this.deck.dealCard(),
    );

    this.hand.fillHand(next);
    return next;
  }

  public checkHand(hand: ICard[] = this.hand.current): Hands | null {
    return evaluateHand(hand);
  }
}
