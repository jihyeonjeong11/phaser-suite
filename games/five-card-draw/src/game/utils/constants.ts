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

export const SUITS = ["HEART", "DIAMOND", "SPADE", "CLUB"] as const;

// poker hand rules from https://github.com/pinkkis/phaser-video-poker
export const HANDS = {
  ROYAL_FLUSH: { name: "Royal Flush", payout: 100 },
  STRAIGHT_FLUSH: { name: "Straight Flush", payout: 50 },
  FOUR_OF_A_KIND: { name: "Four of a Kind", payout: 30 },
  FULL_HOUSE: { name: "Full House", payout: 13 },
  FLUSH: { name: "Flush", payout: 7 },
  STRAIGHT: { name: "Straight", payout: 6 },
  THREE_OF_A_KIND: { name: "Three of a Kind", payout: 3 },
  TWO_PAIR: { name: "Two Pair", payout: 3 },
} as const;

export type Hands = keyof typeof HANDS;

export const Phase = {
  READY: "READY",
  SHUFFLE: "SHUFFLE",
  DEAL: "DEAL",
  HOLD: "HOLD",
  REDRAW: "REDRAW",
  SCORE: "SCORE",
} as const;

export type Phase = (typeof Phase)[keyof typeof Phase];

export const Volume = {
  MUTE: 0,
  ON: 0.5,
} as const;

export const CARD_SCALE = 1.5;
