import { CARD_VALUES } from "./constants";

export const SUITS = ["heart", "spade", "diamond", "club"] as const;
export type Suit = (typeof SUITS)[number]; // "heart" | "spade" | "diamond" | "club"

export type CardValue = (typeof CARD_VALUES)[number];
export type CardSymbol = CardValue["symbol"];

export interface ICard {
  suit: Suit;
  value: CardValue["value"];
  symbol: CardSymbol;
}
