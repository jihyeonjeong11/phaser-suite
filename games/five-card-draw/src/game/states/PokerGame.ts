import { ICard } from "../utils/types";

// phaser-video-poker/src/services/PokerGame.ts 의 checkHand 규칙을 그대로 이식.
// (조커 제외 → 조커 전용인 FIVE_OF_A_KIND 도 제외. 투페어 미만은 원본대로 null)
export enum Hands {
  ROYAL_FLUSH = "Royal Flush",
  STRAIGHT_FLUSH = "Straight Flush",
  FOUR_OF_A_KIND = "Four of a Kind",
  FULL_HOUSE = "Full House",
  FLUSH = "Flush",
  STRAIGHT = "Straight",
  THREE_OF_A_KIND = "Three of a Kind",
  TWO_PAIR = "Two Pair",
}

const sortComparator = (a: ICard, b: ICard): number =>
  a.value > b.value ? 1 : a.value === b.value ? 0 : -1;

// value별 장수 카운트. e.g. 한 쌍 → 해당 value 카운트 2
const handCounts = (hand: ICard[]): Map<number, number> =>
  hand
    .map((c) => c.value)
    .reduce(
      (acc, val) => acc.set(val, 1 + (acc.get(val) || 0)),
      new Map<number, number>(),
    );

export class PokerGame {
  // 5장을 받아 족보를 판정. 투페어 미만이면 null (원본 규칙 그대로).
  public checkHand(hand: ICard[]): Hands | null {
    if (hand.length !== 5) {
      return null;
    }

    if (this.hasRoyal(hand) && this.hasFlush(hand) && this.hasStraight(hand)) {
      return Hands.ROYAL_FLUSH;
    }
    if (this.hasFlush(hand) && this.hasStraight(hand)) {
      return Hands.STRAIGHT_FLUSH;
    }
    if (this.hasFourOfAKind(hand)) {
      return Hands.FOUR_OF_A_KIND;
    }
    if (this.hasFullHouse(hand)) {
      return Hands.FULL_HOUSE;
    }
    if (this.hasFlush(hand)) {
      return Hands.FLUSH;
    }
    if (this.hasStraight(hand)) {
      return Hands.STRAIGHT;
    }
    if (this.hasThreeOfAKind(hand)) {
      return Hands.THREE_OF_A_KIND;
    }
    if (this.hasTwoPair(hand)) {
      return Hands.TWO_PAIR;
    }

    return null;
  }

  // private
  private hasFlush(hand: ICard[]): boolean {
    return hand.every((c) => c.suit === hand[0].suit);
  }

  private hasRoyal(hand: ICard[]): boolean {
    return hand
      .map((c) => c.value)
      .filter((v) => v > 1) // ace(=1) 제외
      .every((v) => v >= 10); // 나머지가 모두 10 이상이면 로열 후보
  }

  private hasStraight(hand: ICard[]): boolean {
    const counts = handCounts(hand);
    // 값이 모두 유니크하지 않으면 스트레이트 불가
    if (counts.size !== 5) {
      return false;
    }

    const sortedHand: number[] = [...hand]
      .sort(sortComparator)
      .map((c) => c.value);
    const hasAce = sortedHand.some((v) => v === 1);
    // 이 스트레이트에서 ace를 high(14)로 봐야 하는지
    const isHigh = sortedHand[hasAce ? 1 : 0] > 5;

    // ace를 1 대신 high(14)로 올려 10-J-Q-K-A 처리
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
  }

  private hasFullHouse(hand: ICard[]): boolean {
    const counts = handCounts(hand);
    // 서로 다른 값이 2종류 → 2 + 3 카운트면 풀하우스
    if (counts.size === 2) {
      const [a, b] = [...counts.values()];
      return a + b === 5; // 2 + 3
    }
    return false;
  }

  private hasTwoPair(hand: ICard[]): boolean {
    const counts = handCounts(hand);
    // 값 3종류(2+2+1). 트리플(3+1+1)은 checkHand에서 먼저 걸러지므로 여기선 투페어.
    return counts.size === 3 && hand.length === 5;
  }

  private hasThreeOfAKind(hand: ICard[]): boolean {
    const counts = handCounts(hand);
    for (const v of counts.values()) {
      if (v === 3) {
        return true;
      }
    }
    return false;
  }

  private hasFourOfAKind(hand: ICard[]): boolean {
    const counts = handCounts(hand);
    for (const v of counts.values()) {
      if (v === 4) {
        return true;
      }
    }
    return false;
  }
}
