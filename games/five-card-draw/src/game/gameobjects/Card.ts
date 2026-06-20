import { GameObjects, Scene } from "phaser";

// 순수 드로잉 뷰. 게임 상태(held 여부 등)를 저장하지 않는다.
// 프레임을 그리고, 잡힘 표시는 위치만 반영한다.
export class Card extends GameObjects.Sprite {
  private readonly restY: number;

  constructor(scene: Scene, x: number, y: number, frame: number) {
    super(scene, x, y, "cardSprite", frame);
    this.restY = y;
  }

  // held 여부에 따라 위치만 갱신 (진실은 Hand가 가짐, 여긴 표시만)
  setHeld(held: boolean): this {
    this.y = this.restY + (held ? -20 : 0);
    return this;
  }
}
