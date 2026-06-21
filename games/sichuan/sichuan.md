A game-clone design preps.

## Title

sichuan

## Playable References

- with gravity https://mukppe.tistory.com/1253
- without gravity https://vidkidz.tistory.com/1044
- https://codepen.io/lewster32/pen/gOYvWZO

## Genre and Concepts

- Puzzle / tile-matching (Mahjong solitaire variant)
- A board is filled with Mahjong tiles laid out on a 2D grid.
- A Player selects two tiles to try to match them.
- Two tiles match when they are the same kind AND can be connected by a path of at most 3 straight segments (2 turns or fewer).
- The connecting path may only pass through empty cells (already-cleared tiles or the outer border) — it cannot cross a remaining tile.
- A matched pair is removed from the board.
- A Player clears the level when all tiles are removed.
- If no valid pair remains, the board is reshuffled (or the Player can ask for a hint).
- Gravity variant: after a pair is removed, the remaining tiles slide in a fixed direction to fill the gap.
- Non-gravity variant: removed tiles simply leave an empty cell; the rest stay in place.

## Things to dump for MVP

- Gravity

## Logics I learned from previous games

- Basic Phaser stuffs (scene flow, registry/HUD, tweens, click input) — reuse for board scene, score, and tile selection.

## Core logics to learn

- Grid model + click -> cell mapping — store tiles in a 2D array, convert a pixel click to (row, col) and back. (foundation)
- Pair connection check (the core new thing) — decide whether two same-kind tiles can be joined by a path of at most 2 turns (3 segments) through empty cells only. Typical approach: test the straight line, then 1-turn (L) paths, then 2-turn paths by scanning a shared empty row/column.
- Solvable board generation — place tiles as matched pairs (and/or verify at least one solution exists) so the level can always be cleared.
- Deadlock detection + reshuffle — scan all remaining tile pairs; if none connect, reshuffle the remaining tiles into a new solvable layout.
- Hint finder — reuse the deadlock scan to surface one currently-connectable pair and highlight it.
- Path rendering — draw the 1-3 line segments of the winning path as feedback before clearing the pair.

## Template

- Phaser + Vite https://github.com/phaserjs/template-vite-ts

## Artworks

- Free assets from https://blueeyedrat.itch.io/pixel-assets-mahjong-tiles/download/eyJpZCI6MTA5NjY4MiwiZXhwaXJlcyI6MTc4MjAyMjM3MH0%3d%2eBuHfOngSBW7ajwVAn%2biOt3HsQRw%3d

## Sounds

- TBD

## Feedbacks

## Backlogs
