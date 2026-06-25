import { ICard } from "../utils/types";

export enum Hands {
  ROYAL_FLUSH = "ROYAL_FLUSH",
  STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
  FOUR_OF_A_KIND = "FOUR_OF_A_KIND",
  FULL_HOUSE = "FULL_HOUSE",
  FLUSH = "FLUSH",
  STRAIGHT = "STRAIGHT",
  THREE_OF_A_KIND = "THREE_OF_A_KIND",
  TWO_PAIR = "TWO_PAIR",
}

const sortComparator = (a: ICard, b: ICard): number =>
  a.value > b.value ? 1 : a.value === b.value ? 0 : -1;

const handCounts = (hand: ICard[]): Map<number, number> =>
  hand
    .map((c) => c.value)
    .reduce(
      (acc, val) => acc.set(val, 1 + (acc.get(val) || 0)),
      new Map<number, number>(),
    );

const hasFlush = (hand: ICard[]): boolean =>
  hand.every((c) => c.suit === hand[0].suit);

const hasRoyal = (hand: ICard[]): boolean =>
  hand
    .map((c) => c.value)
    .filter((v) => v > 1)
    .every((v) => v >= 10);

const hasStraight = (hand: ICard[]): boolean => {
  const counts = handCounts(hand);
  if (counts.size !== 5) {
    return false;
  }

  const sortedHand: number[] = [...hand]
    .sort(sortComparator)
    .map((c) => c.value);
  const hasAce = sortedHand.some((v) => v === 1);
  const isHigh = sortedHand[hasAce ? 1 : 0] > 5;

  if (isHigh && hasAce) {
    sortedHand.push(14);
    sortedHand.shift();
  }

  const lowest = sortedHand[0];
  for (let i = 1; i < sortedHand.length; i++) {
    if (!sortedHand.includes(lowest + i)) {
      return false;
    }
  }

  return true;
};

const hasFullHouse = (hand: ICard[]): boolean => {
  const counts = handCounts(hand);
  if (counts.size === 2) {
    const [a, b] = [...counts.values()];
    return a + b === 5; // 2 + 3
  }
  return false;
};

const hasTwoPair = (hand: ICard[]): boolean => {
  const counts = handCounts(hand);
  return counts.size === 3 && hand.length === 5;
};

const hasThreeOfAKind = (hand: ICard[]): boolean =>
  [...handCounts(hand).values()].includes(3);

const hasFourOfAKind = (hand: ICard[]): boolean =>
  [...handCounts(hand).values()].includes(4);

export function evaluateHand(hand: ICard[]): Hands | null {
  if (hand.length !== 5) {
    return null;
  }

  if (hasRoyal(hand) && hasFlush(hand) && hasStraight(hand)) {
    return Hands.ROYAL_FLUSH;
  }
  if (hasFlush(hand) && hasStraight(hand)) {
    return Hands.STRAIGHT_FLUSH;
  }
  if (hasFourOfAKind(hand)) {
    return Hands.FOUR_OF_A_KIND;
  }
  if (hasFullHouse(hand)) {
    return Hands.FULL_HOUSE;
  }
  if (hasFlush(hand)) {
    return Hands.FLUSH;
  }
  if (hasStraight(hand)) {
    return Hands.STRAIGHT;
  }
  if (hasThreeOfAKind(hand)) {
    return Hands.THREE_OF_A_KIND;
  }
  if (hasTwoPair(hand)) {
    return Hands.TWO_PAIR;
  }

  return null;
}
