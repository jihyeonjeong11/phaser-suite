// solid
// 게임 내부 state만 다룬다. Phaser도 이벤트도 모름 — 순수 로직.

import { ICard } from "../utils/types";

export class GameState {
  cards: ICard[];
  playerHand: ICard[] = [];
  money: number = 1000;

  get getCards() {
    return this.cards;
  }

  set setCards(newDeck: ICard[]) {
    this.cards = newDeck;
  }

  get getPlayerHand(): ICard[] {
    return this.playerHand;
  }

  set setPlayerHand(newDeck: ICard[]) {
    this.playerHand = newDeck;
  }

  public draw(): ICard {
    const card = this.cards.pop();
    if (!card) throw new Error("Deck is empty");
    this.playerHand = [...this.getPlayerHand, card];
    return card;
  }

  public dealCards(count: number): ICard[] {
    return Array.from({ length: count }, () => this.draw());
  }

  // for dev purpose
  public empty(): void {
    this.playerHand = [];
  }
}
