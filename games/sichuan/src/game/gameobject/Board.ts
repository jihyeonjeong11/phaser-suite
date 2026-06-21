import { Actions, Display, GameObjects, Scene, Utils } from "phaser";
import { SichuanBoardType } from "../utils/types";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../utils/constants";
import { TileSprite } from "./TileSprite";

// board width 14 * 10

// 랜덤 -> 모든 칸 수를 짝으로 채워야 함.

//  보드를 캔버스에 맞출 때 남길 여백 비율(0~1). 0.95 = 가장자리 5% 여백.
const FIT = 0.95;

/**
 * 
  핵심 로직은 frame_4/DoAction_2.as:378~430 에 있습니다. 난독화돼 있어 변수명을 역할로 풀어쓰면:

  1. 패 덱(140장) 생성 — :378~394

  i = 1; while(i < 141) {
     if(i < 31)            tiles[i] = i;              // 1~30번: 고정 패 종류 30종
     if(30 < i && i < 71)  tiles[i] = random(45)+1;   // 31~70번: 랜덤 패 종류 (1~45 중)
     if(i > 70)            tiles[i] = tiles[i-70];     // 71~140번: 1~70번을 그대로 복제
     i++;
  }
  → 앞 70장 + 뒤 70장(복제)으로 모든 패가 반드시 짝(2개씩) 이 되도록 보장. 종류 일부는 고정, 일부는 random.

  2. 셔플 — :396~404

  i = 0; while(i < 100) {            // 100번 무작위 swap
     a = random(140)+1; b = random(140)+1;
     tmp = tiles[a]; tiles[a] = tiles[b]; tiles[b] = tmp;
  }


 */

export class Board extends GameObjects.Container {
  board: SichuanBoardType;
  private frames: string[];

  constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.frames = this.loadFrames();
    this.startBoard();
    this.drawBoard();
  }

  private loadFrames(): string[] {
    return this.scene.textures.get("tiles").getFrameNames();
  }

  private startBoard() {
    //  1) 짝 보장 평평한 덱(길이 140 = 70쌍) → 2) Phaser 셔플 → 3) 14×10로 잘라 담기.
    const deck = Utils.Array.Shuffle(this.buildDeck());

    this.board = Array.from({ length: BOARD_WIDTH }, () =>
      Array<string>(BOARD_HEIGHT),
    );
    let p = 0;
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        this.board[col][row] = deck[p++];
      }
    }
  }

  //  안쪽 칸 수(14×10=140)만큼 짝수개로 채운 평평한 덱. 항상 풀 수 있는 보드가 보장된다.
  private buildDeck(): string[] {
    const kinds = this.frames; // 현재 34종
    const deck: string[] = [];

    //  (a) 34종을 각 1쌍씩(68장) → 모든 종이 최소 한 번 등장.
    for (const k of kinds) deck.push(k, k);

    //  (b) 남은 칸을 랜덤 쌍으로: (140 - 68) / 2 = 36쌍.
    const pairsLeft = (BOARD_WIDTH * BOARD_HEIGHT - deck.length) / 2;
    for (let i = 0; i < pairsLeft; i++) {
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      deck.push(k, k);
    }
    return deck;
  }

  private drawBoard() {
    const { cutWidth: tileW, cutHeight: tileH } = this.scene.textures.getFrame(
      "tiles",
      this.frames[0],
    );

    const tiles: TileSprite[] = [];
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const frame = this.board[col][row]; // 칸에 저장된 kind가 곧 프레임 이름
        tiles.push(new TileSprite(this.scene, 0, 0, "tiles", frame));
      }
    }
    this.add(tiles);

    Actions.GridAlign(tiles, {
      width: BOARD_WIDTH,
      height: BOARD_HEIGHT,
      cellWidth: tileW,
      cellHeight: tileH,
      position: Display.Align.CENTER,
      x: 0,
      y: 0,
    });

    // 추후 모바일 영역에 대해 고민할것
    const canvasW = this.scene.scale.width;
    const canvasH = this.scene.scale.height;
    const scale =
      FIT *
      Math.min(
        canvasW / (BOARD_WIDTH * tileW),
        canvasH / (BOARD_HEIGHT * tileH),
      );

    this.setScale(scale);
    this.setPosition(
      (canvasW - BOARD_WIDTH * tileW * scale) / 2,
      (canvasH - BOARD_HEIGHT * tileH * scale) / 2,
    );
  }
}
