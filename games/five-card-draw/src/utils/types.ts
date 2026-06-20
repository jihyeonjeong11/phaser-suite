export const SUITS = ["heart", "spade", "diamond", "club"] as const;
export type Suit = (typeof SUITS)[number]; // "heart" | "spade" | "diamond" | "club"

export const CARD_VALUES = [
  { value: 1, symbol: "A" },
  { value: 2, symbol: "2" },
  { value: 3, symbol: "3" },
  { value: 4, symbol: "4" },
  { value: 5, symbol: "5" },
  { value: 6, symbol: "6" },
  { value: 7, symbol: "7" },
  { value: 8, symbol: "8" },
  { value: 9, symbol: "9" },
  { value: 10, symbol: "10" },
  { value: 11, symbol: "J" },
  { value: 12, symbol: "Q" },
  { value: 13, symbol: "K" },
] as const;

export type CardValue = (typeof CARD_VALUES)[number];
export type CardSymbol = CardValue["symbol"];

export interface ICard {
  suit: Suit;
  value: CardValue["value"];
  symbol: CardSymbol;
}
