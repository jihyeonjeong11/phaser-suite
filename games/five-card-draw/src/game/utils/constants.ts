import { ICard } from "./types";

// 추후 옵션값으로 빠질 수 있는 값과 정해진 값

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

// 게임 시작 시 받는 카드 수 (5-card draw)

export const SUIT_ROW: Record<ICard["suit"], number> = {
  heart: 0,
  diamond: 1,
  spade: 2,
  club: 3,
};
export const FRAMES_PER_ROW = 19;
