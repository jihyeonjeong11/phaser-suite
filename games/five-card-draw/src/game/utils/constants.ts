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
export const HAND_RANKINGS = {
  ROYAL_FLUSH: "Royal Flush",
  STRAIGHT_FLUSH: "Straight Flush",
  FOUR_OF_A_KIND: "Four of a Kind",
  FULL_HOUSE: "Full House",
  FLUSH: "Flush",
  STRAIGHT: "Straight",
  THREE_OF_A_KIND: "Three of a Kind",
  TWO_PAIR: "Two Pair",
} as const;

export const Phase = {
  READY: "READY",
  SHUFFLE: "SHUFFLE",
  DEAL: "DEAL",
  HOLD: "HOLD",
  REDRAW: "REDRAW",
  SCORE: "SCORE",
} as const;

// 값들의 유니온: "READY" | "SHUFFLE" | "DEAL" | "HOLD" | "DRAW" | "SCORE"
// 같은 이름의 const(값)와 type(타입)은 TS에서 공존 가능 (이름공간 분리)
export type Phase = (typeof Phase)[keyof typeof Phase];

export const Volume = {
  MUTE: 0,
  ON: 0.5,
} as const;

export const CARD_SCALE = 1.5;
