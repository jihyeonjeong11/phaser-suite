import { ICard } from "./types";

// 씬에서 발행되어 gameObjects로 전달되는 이벤트들 (Phaser scene.events 위에서 흐름)
export const GameEvents = {
  CardDealt: "card-dealt",
  HandReset: "hand-reset", // 손패 비우기: Hand가 받아 스프라이트를 모두 제거
} as const;

export interface CardDealtPayload {
  card: ICard;
  index: number; // 손패에서 몇 번째 슬롯인지
}
