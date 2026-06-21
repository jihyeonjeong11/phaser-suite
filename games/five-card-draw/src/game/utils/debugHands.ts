import { ICard, Suit } from "./types";
import { CARD_VALUES } from "./constants";
import { Hands } from "../states/PokerGame";

// value로 symbol을 채워 ICard 한 장 생성 (디버그용 핸드 조립)
const card = (suit: Suit, value: ICard["value"]): ICard => {
  const symbol = CARD_VALUES.find((c) => c.value === value)!.symbol;
  return { suit, value, symbol };
};

// 각 족보가 "확정으로" 나오는 고정 핸드. expected와 checkHand 결과를 대조해 검증한다.
export const DEBUG_HANDS: {
  label: string;
  expected: Hands | null;
  cards: ICard[];
}[] = [
  {
    label: "Royal Flush",
    expected: Hands.ROYAL_FLUSH,
    cards: [
      card("heart", 10),
      card("heart", 11),
      card("heart", 12),
      card("heart", 13),
      card("heart", 1), // A
    ],
  },
  {
    label: "Straight Flush",
    expected: Hands.STRAIGHT_FLUSH,
    cards: [
      card("spade", 5),
      card("spade", 6),
      card("spade", 7),
      card("spade", 8),
      card("spade", 9),
    ],
  },
  {
    label: "Four of a Kind",
    expected: Hands.FOUR_OF_A_KIND,
    cards: [
      card("heart", 7),
      card("diamond", 7),
      card("spade", 7),
      card("club", 7),
      card("heart", 13),
    ],
  },
  {
    label: "Full House",
    expected: Hands.FULL_HOUSE,
    cards: [
      card("heart", 3),
      card("diamond", 3),
      card("spade", 3),
      card("heart", 9),
      card("diamond", 9),
    ],
  },
  {
    label: "Flush",
    expected: Hands.FLUSH,
    cards: [
      card("heart", 2),
      card("heart", 5),
      card("heart", 7),
      card("heart", 9),
      card("heart", 11), // 연속 아님 → 스트레이트 아님
    ],
  },
  {
    label: "Straight",
    expected: Hands.STRAIGHT,
    cards: [
      card("heart", 5),
      card("diamond", 6),
      card("spade", 7),
      card("club", 8),
      card("heart", 9), // 무늬 섞임 → 플러시 아님
    ],
  },
  {
    label: "Three of a Kind",
    expected: Hands.THREE_OF_A_KIND,
    cards: [
      card("heart", 4),
      card("diamond", 4),
      card("spade", 4),
      card("heart", 8),
      card("diamond", 13),
    ],
  },
  {
    label: "Two Pair",
    expected: Hands.TWO_PAIR,
    cards: [
      card("heart", 6),
      card("diamond", 6),
      card("spade", 9),
      card("club", 9),
      card("heart", 13),
    ],
  },
  {
    label: "No Win",
    expected: null, // 원페어/하이카드는 원본 규칙대로 null
    cards: [
      card("heart", 2),
      card("diamond", 2),
      card("spade", 5),
      card("club", 9),
      card("heart", 11),
    ],
  },
];
