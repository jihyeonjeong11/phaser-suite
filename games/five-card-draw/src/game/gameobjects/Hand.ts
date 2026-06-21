import { GameObjects, Scene } from "phaser";
import { ICard } from "../utils/types";
import { CardDealtPayload, GameEvents } from "../utils/events";
import { CardSprite } from "./CardSprite";

// 손패가 화면 어디에 어떻게 놓이는지 (Game이 카메라 보고 주입 → Hand는 좌표를 모름)
export interface HandLayout {
  deck: { x: number; y: number }; // 카드가 출발하는 덱 더미 위치
  anchor: { x: number; y: number }; // 첫 번째 슬롯(맨 왼쪽) 위치
  gap: number; // 슬롯 간격
}

// 순수 뷰. 상태를 소유하지 않고, 씬이 방송한 "카드 딜" 이벤트를 받아 연출만 한다.
export class Hand extends GameObjects.Container {
  private static readonly STAGGER = 120; // 장마다 출발 지연 (ms)

  constructor(
    scene: Scene,
    private layout: HandLayout,
  ) {
    super(scene, 0, 0); // (0,0)에 두면 컨테이너 로컬좌표 == 월드좌표

    scene.events.on(GameEvents.CardDealt, (p: CardDealtPayload) => {
      this.dealTo(p.index, p.card);
    });
    scene.events.on(GameEvents.HandReset, () => this.clear());
  }

  // 진행 중인 트윈까지 정리하고 모든 카드 스프라이트를 제거한다.
  private clear(): void {
    this.scene.tweens.killTweensOf(this.list); // 딜/플립 도중이어도 안전하게 중단
    this.removeAll(true); // true = 자식(CardSprite)들을 destroy까지
  }

  // i번째 슬롯으로 한 장 연출: 덱에서 뒷면으로 출발 → 슬롯으로 이동 → 도착하면 뒤집기
  private dealTo(i: number, card: ICard): void {
    const sprite = new CardSprite(
      this.scene,
      this.layout.deck.x,
      this.layout.deck.y,
    ).setScale(1.5);
    this.add(sprite);

    this.scene.tweens.add({
      targets: sprite,
      x: this.layout.anchor.x + i * this.layout.gap,
      y: this.layout.anchor.y,
      duration: 400,
      delay: i * Hand.STAGGER, // i번째 카드는 그만큼 늦게 출발 → 한 장씩
      ease: "Cubic.easeOut",
      onComplete: () => sprite.flipTo(card),
    });
  }
}
