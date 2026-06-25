import { Scene, Scenes } from "phaser";
import { CardObject } from "../gameobjects/CardObject";
import { PokerGame } from "../poker/PokerGame";
import { Button } from "../gameobjects/Button";
import { ShuffleDeck } from "../gameobjects/ShuffleDeck";
import { Volume, HANDS } from "../utils/constants";
import { Phase } from "../utils/constants";
import { HUD } from "../gameobjects/HUD";

//SOLID

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
  pokerGame!: PokerGame;
  cardObject!: CardObject;

  private button!: Button; // 하단 단일 액션 버튼 (재사용)
  private shuffleDeck!: ShuffleDeck;
  private hud!: HUD;
  private holdButtons: Button[] = [];

  constructor() {
    super("Game");
  }

  init() {
    this.pokerGame = new PokerGame();

    // Initial registry
    // TODO: make SOLID on V2
    this.registry.set("volume", Volume.MUTE);
    this.registry.set("state", Phase.READY);
    this.registry.set("money", 1000);
    this.registry.set("bet", 100);
    this.registry.set("winnings", { current: 0, previous: 0 });
  }

  private restart(): void {
    this.holdButtons.forEach((b) => b.destroy());
    this.holdButtons = [];

    this.pokerGame.reset();
    this.cardObject.clear();
    this.hud.setResult("");

    this.registry.set("state", Phase.READY);
    this.spawnButton("DEAL", this.startDeal);
  }

  private spawnButton(label: string, onClick: () => void): void {
    this.button.setAction(label, onClick).show();
  }

  private startDeal = (): void => {
    this.registry.set(
      "money",
      this.registry.get("money") - this.registry.get("bet"),
    );
    this.registry.set("state", Phase.SHUFFLE);
  };

  create() {
    const { centerX, centerY, height } = this.cameras.main;
    this.cardObject = new CardObject(this, {
      deck: { x: centerX, y: centerY - 40 },
      anchor: { x: centerX - 2 * 120, y: height - 160 },
      gap: 120,
    });

    this.shuffleDeck = new ShuffleDeck(this, centerX, centerY - 40);
    this.hud = new HUD(this, 0, 0);
    this.registry.events.on("changedata-state", (_p: unknown, data: Phase) =>
      this.stateChange(data),
    );
    this.registry.events.on("changedata-money", (_p: unknown, v: number) =>
      this.hud.setMoney(v),
    );
    this.registry.events.on("changedata-bet", (_p: unknown, v: number) =>
      this.hud.setBet(v),
    );
    this.hud.setMoney(this.registry.get("money"));
    this.hud.setBet(this.registry.get("bet"));

    this.button = new Button(
      this,
      centerX,
      height - 60,
      "DEAL",
      this.startDeal,
    );

    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off("changedata-state");
      this.registry.events.off("changedata-money");
      this.registry.events.off("changedata-bet");
    });
  }

  private stateChange(data: Phase) {
    switch (data) {
      case Phase.READY:
        break;

      case Phase.SHUFFLE:
        this.button.hide();
        this.shuffleDeck.shuffleAnimation(() =>
          this.registry.set("state", Phase.DEAL),
        );
        break;

      case Phase.DEAL:
        this.pokerGame.draw().forEach((card, i) =>
          this.cardObject.dealTo(i, card, () => {
            if (i === 4) this.registry.set("state", Phase.HOLD);
          }),
        );
        break;

      case Phase.HOLD:
        this.holdButtons = this.pokerGame.getCards.map(
          (c, i) =>
            new Button(this, 100, 100 + i * 50, `hold card${i}`, () => {
              this.pokerGame.heldCard(c);
              const isHeld = this.pokerGame.getHeldCards.some(
                (h) => h.suit === c.suit && h.value === c.value,
              );
              this.cardObject.setHeld(i, isHeld);
            }),
        );

        this.spawnButton("redraw", () =>
          this.registry.set("state", Phase.REDRAW),
        );
        break;
      case Phase.REDRAW: {
        this.button.hide();
        this.holdButtons.forEach((b) => b.destroy());
        this.holdButtons = [];

        const held = this.pokerGame.getHeldCards;
        const wasHeld = this.pokerGame.getCards.map((c) =>
          held.some((h) => h.suit === c.suit && h.value === c.value),
        );

        this.pokerGame.redraw();

        this.pokerGame.getCards.forEach((card, i) => {
          if (!wasHeld[i]) {
            this.cardObject.replaceAt(i, card, () => null);
          } else {
            this.cardObject.setHeld(i, false);
          }
          if (i === 4)
            this.time.delayedCall(900, () =>
              this.registry.set("state", Phase.SCORE),
            );
        });
        break;
      }
      case Phase.SCORE: {
        const result = this.pokerGame.checkHand();
        if (result) {
          const { name, payout } = HANDS[result];
          this.registry.set(
            "money",
            this.registry.get("money") + payout * this.registry.get("bet"),
          );
          this.hud.setResult(name);
        } else {
          this.hud.setResult("No Win");
        }

        if (this.registry.get("money") <= 0) {
          this.spawnButton("NEW GAME", () => this.scene.restart());
        } else {
          this.spawnButton("Another Round", () => this.restart());
        }
        break;
      }
    }
  }
}
