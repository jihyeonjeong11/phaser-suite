import { Scene } from "phaser";
import { Board } from "../gameobject/Board";

// Board: 원하는대로? 11 * 19
// Tile: phaser 스프라이트?
// board(모듈) -> 실제 타일 매칭(phaser)

// 액션: 마우스 커서 or 터치
// 타일 클릭: 해당 타일 선택 어둡게
// 다른 타일 클릭: search(), 사천성 규칙에 맞다면 제거, 점수 상승
// 규칙에 맞지 않다면 해당 타일 선택 제거

// ui: 타이머, 점수, 제거할 수 있는 페어 숫자

// 타입, 상수
// module: 보드
// gameobject: tile, tileboard?

export class Game extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  board: Board;

  constructor() {
    super("Game");
  }

  init() {
    this.board = new Board(this, 0, 0);
  }

  create() {
    this.camera = this.cameras.main;
    this.camera.setBackgroundColor(0x2d2d44);

    this.input.once("pointerdown", () => {
      this.scene.start("GameOver");
    });
  }
}
