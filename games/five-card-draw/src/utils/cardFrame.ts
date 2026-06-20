import { ICard } from "./types";

// 카드(suit, value)를 cardSprite 스프라이트시트의 프레임 번호로 변환.
// 시트 행 순서: ♥0 ♦1 ♠2 ♣3, 한 행은 이미지 전체 폭 기준 floor(944/48)=19칸.
const SUIT_ROW: Record<ICard["suit"], number> = {
  heart: 0,
  diamond: 1,
  spade: 2,
  club: 3,
};
const FRAMES_PER_ROW = 19;

export const cardFrame = (card: ICard): number =>
  SUIT_ROW[card.suit] * FRAMES_PER_ROW + (card.value - 1);
