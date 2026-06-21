import { FRAMES_PER_ROW, SUIT_ROW } from "./constants";
import { ICard } from "./types";

export const cardFrame = (card: ICard): number =>
  SUIT_ROW[card.suit] * FRAMES_PER_ROW + (card.value - 1);
