import { GameObjects, Scene } from "phaser";
import { Hands } from "../states/PokerGame";

// 현재 손패의 족보를 텍스트로 보여주는 순수 뷰. 판정은 PokerGame이 하고, 결과만 받아 표시.
export class ScoreText extends GameObjects.Text {
  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y, "-", {
      fontSize: "20px",
      color: "#ffd700",
      fontStyle: "bold",
    });
    this.setOrigin(0, 0.5); // 왼쪽 정렬: 버튼 오른쪽에 자연스럽게 붙음
    scene.add.existing(this);
  }

  // null(투페어 미만)이면 꽝 표시
  public show(hand: Hands | null): void {
    this.setText(hand ?? "No Win");
  }
}
