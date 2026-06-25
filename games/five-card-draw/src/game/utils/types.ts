import { CARD_VALUES, SUITS } from "./constants";

// 순서 = cards.png의 행 순서 (HEART=0, DIAMOND=1, SPADE=2, CLUB=3). 바꾸면 렌더가 어긋남.
export type Suit = (typeof SUITS)[number]; // "HEART" | "DIAMOND" | "SPADE" | "CLUB"

export type CardValue = (typeof CARD_VALUES)[number];
export type CardSymbol = CardValue["symbol"];

export interface ICard {
  suit: Suit;
  value: CardValue["value"];
  symbol: CardSymbol;
}
