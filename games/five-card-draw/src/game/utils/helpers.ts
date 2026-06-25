import { ICard } from "./types";

export const getCardFrameKey = (card: Pick<ICard, "suit" | "value">): string =>
  `${card.suit}-${card.value}`;
