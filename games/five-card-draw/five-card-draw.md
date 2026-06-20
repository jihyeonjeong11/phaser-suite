A game-clone design preps.

## Title

five-draws

## Playable References

- https://www.cardzmania.com/5CardDraw — vs computer, no signup/ads. The faithful-rules baseline (betting + draw + showdown) to measure MVP cuts against.
- https://www.247freepoker.com/ — quick browser play, no signup.
- https://en.wikipedia.org/wiki/Five-card_draw — rules reference for the concept list.

## Genre and Concepts

- Card / casino poker — turn-based (no real-time loop; the "tick" is each player's action).
- Heads-up: Player vs one AI opponent. Each starts with a money variable.
- A hand begins by dealing 5 cards face down to each side — the Player sees their own, the AI's stay hidden until showdown.
- Betting is full: Check / Bet / Call / Raise / Re-raise / Fold, resolved in a betting loop that goes back and forth until both sides have matched (or one folds).
- Round flow per hand: deal → betting round 1 → draw (discard any of your 5, draw replacements from the deck) → betting round 2 → showdown.
- At showdown the better 5-card poker hand (standard hand rankings) wins the pot.
- A side can also win the pot immediately if the opponent folds — no showdown needed.
- Money: bets/calls/raises move money into the pot; the hand winner takes the whole pot.
- Tournament win/lose: win the game when the AI's money hits 0; lose when the Player's money hits 0. One game = many hands.

## Things to dump for MVP

- Pre-draw betting round — faithful 5-card draw bets before AND after the draw; MVP flow is deal → one draw → a single betting round → showdown.
- Bluffing AI — MVP AI plays honestly off hand strength only (no bet/raise on a weak hand to deceive).
- Blinds/ante escalation — MVP uses a fixed ante each hand; no tournament time-pressure ramp.
- (Kept in MVP, not dumped: variable bet sizing, and card deal/flip animation.)

## Logics I learned from previous games

- Scene flow & win/lose transitions — gold-miner scenes (MainMenu / Game / GameOver / GameComplete). Reuse for game start, bust (lose), and tournament win.
- State + HUD via registry — gold-miner registry.ts + Hud.ts. Reuse for each side's money and the pot display instead of score.
- Game state flow (READY/PLAY/OVER) + reset — flappy/fishy. Reuse for the per-hand phases (deal → draw → bet → showdown) and resetting between hands.
- Asset preload — gold-miner Preloader. Reuse for loading the 52 card-face images + card back.
- Pointer/click input on objects — gold-miner/Phaser input. Reuse for selecting cards to discard and clicking Bet/Call/Raise/Fold buttons.
- NOTE: the arcade physics from past games (gravity, velocity integration, AABB collision, real-time update(dt)) do NOT carry over — this game is turn-based/event-driven, which is itself the new shape.

## Core logics to learn

- 52-card deck model — build the deck, Fisher-Yates shuffle, deal 5 each, draw replacements from the remaining deck. (foundational new thing)
- Poker hand evaluation — rank a 5-card hand into a category (high card → straight flush) into a comparable score, then compare two hands including kicker/tiebreakers. (the biggest new thing — and the part to actually learn since cards are unfamiliar)
- Turn-based betting loop — a state machine alternating Player/AI actions (Bet/Call/Raise/Re-raise/Fold), tracking the pot + each side's committed money, ending when amounts match or someone folds. Event-driven on button clicks, NOT a real-time update(dt) loop. (the new control-flow shape)
- Discard/draw selection — click cards to toggle keep/discard, then replace the discarded ones from the deck (one draw only).
- Honest AI decision — evaluate its own hand, choose which cards to keep, and pick a betting action from hand strength (no bluff in MVP).

## Artworks

- Card faces (52) + card back — Kenney Playing Cards Pack (CC0, free): https://kenney.nl/assets/playing-cards-pack. NOT a bottleneck (unlike digdug's inflation sprites) — this game clears the art gate.
- Pixel-art alt if a retro look is wanted — free playing-card packs on itch.io (ELV Games / George Blackwell).
- Table: simple colored shapes / felt-green background are fine for MVP; money/pot is just a text counter, not a blocker.
- AI opponent avatar — optional static image, not required.

## Sounds

- https://pixabay.com/sound-effects/ — card deal/flip, shuffle, money bet/win clink, win/lose stings.

## Feedbacks

- Flow decision: dropped the faithful pre-draw betting round, keeping a single post-draw betting round (deal → draw → bet → showdown). Reason: the user is new to poker, so this keeps the hand loop learnable while still preserving the interesting part — the Raise/Re-raise betting loop.
- AI decision: heads-up vs one HONEST AI (no bluff) for MVP. An honest hand-strength AI is enough to exercise the two core new systems (hand evaluation + betting loop) and is far easier to debug than a bluffing one.
- Art gate: cleared. A CC0 full deck exists, so unlike digdug there is no art-availability hold — this game is OK to build.
- Scope flag: variable bet sizing + card animations were kept in MVP (not dumped). These add UI/polish work; revisit if MVP slips.

## Backlogs

- A minigame for upcoming big game, Lost dutchman's mine
- https://github.com/jsfehler/phaser-ui-tools
