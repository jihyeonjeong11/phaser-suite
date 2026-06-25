import { Scene, Scenes } from "phaser";
import { CardObject } from "../gameobjects/CardObject";
import { CardSprite } from "../gameobjects/CardSprite";
import { PokerGame } from "../poker/PokerGame";
import { Button } from "../gameobjects/Button";
import { ShuffleDeck } from "../gameobjects/ShuffleDeck";
import { Volume, HAND_RANKINGS } from "../utils/constants";
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

  private dealButton!: Button;
  private shuffleDeck!: ShuffleDeck;
  private hud!: HUD;
  private holdButtons: Button[] = [];
  private restartButton?: Button;

  constructor() {
    super("Game");
  }

  init() {
    this.pokerGame = new PokerGame();

    // Initial registry
    this.registry.set("volume", Volume.MUTE);
    this.registry.set("state", Phase.READY);
    this.registry.set("money", 1000);
    this.registry.set("bet", 1000);
    this.registry.set("winnings", { current: 0, previous: 0 });
  }

  private restart(): void {
    this.holdButtons.forEach((b) => b.destroy());
    this.holdButtons = [];
    this.restartButton?.destroy();
    this.restartButton = undefined;

    this.pokerGame.reset();
    this.cardObject.clear();
    this.hud.setResult("");

    this.registry.set("state", Phase.READY);
    const { centerX, height } = this.cameras.main;
    this.dealButton = new Button(this, centerX, height - 60, "DEAL", () =>
      this.registry.set("state", Phase.SHUFFLE),
    );
  }

  create() {
    const { centerX, centerY, height } = this.cameras.main;
    this.cardObject = new CardObject(this, {
      deck: { x: centerX, y: centerY - 40 },
      anchor: { x: centerX - 2 * 70, y: height - 120 },
      gap: 70,
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

    this.dealButton = new Button(this, centerX, height - 60, "DEAL", () => {
      this.registry.set(
        "money",
        this.registry.get("money") - this.registry.get("bet"),
      );
      this.registry.set("state", Phase.SHUFFLE);
    });

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
        this.dealButton.destroy();
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
        const { centerX, height } = this.cameras.main;

        this.holdButtons = this.pokerGame.getCards.map(
          (c, i) =>
            new Button(this, 100, 100 + i * 50, `hold card${i}`, () => {
              this.pokerGame.heldCard(c);
              const sprite = this.cardObject.getAt(i) as CardSprite;
              const isHeld = this.pokerGame.getHeldCards.some(
                (h) => h.suit === c.suit && h.value === c.value,
              );
              isHeld ? sprite.setTint(0x888888) : sprite.clearTint();
            }),
        );

        this.dealButton = new Button(this, centerX, height - 30, "redraw", () =>
          this.registry.set("state", Phase.REDRAW),
        );
        break;
      case Phase.REDRAW: {
        this.dealButton.destroy();
        this.holdButtons.forEach((b) => b.destroy());
        this.holdButtons = [];

        const held = this.pokerGame.getHeldCards;
        const wasHeld = this.pokerGame.getCards.map((c) =>
          held.some((h) => h.suit === c.suit && h.value === c.value),
        );

        this.pokerGame.redraw();

        const sprites = this.pokerGame.getCards.map(
          (_c, i) => this.cardObject.getAt(i) as CardSprite,
        );

        this.pokerGame.getCards.forEach((card, i) => {
          if (!wasHeld[i]) {
            sprites[i].destroy();
            this.cardObject.dealTo(i, card, () => null);
          } else {
            sprites[i].clearTint();
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
        this.hud.setResult(result ? HAND_RANKINGS[result] : "No Win");
        const { centerX, height } = this.cameras.main;

        if (this.registry.get("money") <= 0) {
          this.time.delayedCall(900, () => {
            this.restart();
            this.restartButton = new Button(
              this,
              centerX,
              height - 60,
              "NEW GAME",
              () => this.scene.restart(),
            );
          });
        } else {
          this.restartButton = new Button(
            this,
            centerX,
            height - 60,
            "Another Round",
            () => {
              this.restart();
            },
          );
        }
      }
    }
  }
}
