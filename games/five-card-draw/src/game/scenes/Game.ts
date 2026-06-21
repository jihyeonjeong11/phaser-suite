import { Scene } from "phaser";
import { Hand } from "../gameobjects/Hand";
import { Deck } from "../modules/Deck";
import { GameState } from "../states/GameState";
import { CardDealtPayload, GameEvents } from "../utils/events";
import { STARTING_HAND } from "../config/gameOption";
import { PokerGame } from "../states/PokerGame";
import { Button } from "../gameobjects/Button";
import { ScoreText } from "../gameobjects/ScoreText";
import { DEBUG_HANDS } from "../utils/debugHands";

//SOLID
// 여기서는 클래스 시작과 draw update에서 phaser로 렌더를 넘김.

// base logic
// 1. Create deck
// 2. Shuffle
// 3. Handout to player
// 4. console.log for random cards

// base draw
// 1. preload card sprites
// 2. create complete deck
// 3. draw

export class Game extends Scene {
  deck!: Deck;
  hand!: Hand;
  gameState: GameState;
  pokerGame: PokerGame;
  scoreText!: ScoreText;

  constructor() {
    super("Game");
  }

  init() {
    this.gameState = new GameState();
    this.deck = new Deck();
    this.restart();
  }

  private restart(): void {
    const cards = this.deck.startDeck();
    this.gameState.setCards = this.deck.shuffle(cards);
    this.gameState.setPlayerHand = [];
  }

  create() {
    const { centerX, centerY, height } = this.cameras.main;

    // 중앙에 뒷면 덱 더미 (카드가 여기서 출발하는 느낌)
    this.add.image(centerX, centerY, "cardBg", "back").setScale(1.5);

    // 1) Hand가 먼저 씬 이벤트를 구독 (구독이 방송보다 앞서야 받음). 좌표는 Game이 주입.
    this.hand = new Hand(this, {
      deck: { x: centerX, y: centerY },
      anchor: { x: centerX - 2 * 70, y: height - 120 },
      gap: 70,
    });
    this.add.existing(this.hand);

    this.pokerGame = new PokerGame();
    this.scoreText = new ScoreText(this, centerX + 80, height - 40); // REDRAW 오른쪽

    // REDRAW 버튼: 매번 새로 셔플 → 딜 → 족보 표시
    new Button(this, centerX, height - 40, "REDRAW", () => this.dealHand());

    // [DEBUG] 왼쪽에 족보별 버튼 컬럼: 고정 핸드를 주입해 PokerGame 판정 검증
    DEBUG_HANDS.forEach((h, i) => {
      new Button(this, 130, 50 + i * 44, h.label, () => this.forceHand(h));
    });

    // 첫 핸드
    this.dealHand();
  }

  // [DEBUG] 고정 핸드를 강제로 화면+상태에 주입하고 판정 결과를 콘솔에 대조
  private forceHand(h: (typeof DEBUG_HANDS)[number]): void {
    this.events.emit(GameEvents.HandReset);
    this.gameState.setPlayerHand = h.cards;

    h.cards.forEach((card, index) => {
      this.events.emit(GameEvents.CardDealt, {
        card,
        index,
      } satisfies CardDealtPayload);
    });

    const result = this.pokerGame.checkHand(this.gameState.playerHand);
    this.scoreText.show(result);
    console.log(
      `[${h.label}] expected=${h.expected} got=${result} ${result === h.expected ? "✅" : "❌"}`,
    );
  }

  // 손패를 비우고 새로 5장 딜한 뒤 족보를 평가해 화면에 표시
  private dealHand(): void {
    this.events.emit(GameEvents.HandReset); // 화면의 카드 스프라이트 제거
    this.restart(); // 덱 다시 셔플 + playerHand 비우기

    this.gameState.dealCards(STARTING_HAND).forEach((card, index) => {
      this.events.emit(GameEvents.CardDealt, {
        card,
        index,
      } satisfies CardDealtPayload);
    });

    this.scoreText.show(this.pokerGame.checkHand(this.gameState.playerHand));
  }
}
