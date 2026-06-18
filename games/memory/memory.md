A game-clone design preps.

## Title

memory

## Playable References

https://www.helpfulgames.com/subjects/brain-training/memory.html

## Genre and Concepts

- When game started, renders randomly generated conuntry flag cards, backside. 100 x 100 size.
- Timer? Need some approx time.
- Generated cards must be matched with its identical.
- When a card clicked first time, flip the card to show its contents.
- When a second card clicked, flip the card, and if there are identical, play a sound and remove two cards and adds score.
- When Two card clicked, prevents another click action.
- If not identical, Two cards must be backflipped to its original state after some time.
- When timers ends, game over. Corrected fairs: n
- When all cards removed, wins the game showing score. You Won! Corrected fairs: n

## Things to dump for MVP

- Timer / game-over-on-time. Ship "match all = win" first, add timer later.
- Difficulty / grid-size selection. Hardcode one grid (e.g. 4x4 = 8 pairs) for MVP.
- High score persistence.

## Logics I learned from previous games

- Score counter — flappy
- Win/lose end state + result screen ("You Won!", pairs: n) — flappy game-over pattern
- SFX playback (flip / match / mismatch) — flappy `SFX.play()`

## Core logics to learn

- Pair generation + shuffle: pick N countries, duplicate each into 2 cards, Fisher-Yates shuffle (avoid biased `sort(() => Math.random())`).
- Per-card state machine: `FACE_DOWN -> FACE_UP -> MATCHED`. (flappy's state machine was whole-game; here every card has its own state.)
- Two-pick match flow (board state) — the core:
  - click first card -> open, store as firstPick
  - click second card -> open, compare
    - match -> both MATCHED, score++, clear firstPick
    - mismatch -> show briefly, then both back to FACE_DOWN
- Input lock (most common bug): block clicks while a mismatch is flipping back; also ignore clicks on the same card / already-MATCHED cards. Release lock on `transitionend` or `setTimeout`.
- DOM + CSS game structure (no canvas): cards are DOM elements in `display: grid`; flip via `transform: rotateY(180deg)` + `transition`; tie the flip-back timing to the input lock.

## Artworks

- Country flag SVGs (ISO 3166 codes) already in `public/memory/` — served at `./memory/<CODE>.svg`. ~250 flags. Source: flag-icons style set.

## Sounds

- flip / match / mismatch SFX — TBD (Pixabay / Kenney Audio, like flappy).

## Feedbacks
