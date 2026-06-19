A game-clone design preps.

## Title

fishy

## Playable References

https://freefishy.org/

## Genre and Concepts

- Arcade / eat-em-up (size progression).
- A Player controls a fish with the keyboard (arrow keys / WASD) — velocity-based movement: hold to move at a steady speed, release to stop (or coast). The arcade core is threading the player hitbox narrowly past bigger fish.
- A Player eats any fish smaller than itself.
- Eating a smaller fish grows the Player a little (scale up).
- A Player is eaten and killed when it touches a fish bigger than itself.
- Fish spawn off-screen at the edges and swim across in a straight line, then despawn on the far side.
- As the Player grows, bigger fish become edible and previously-deadly fish turn into food.
- Fish spawn with random size/speed/direction from a fixed pool — like the original, no difficulty scaling over time.
- A Player wins by reaching a target size (became the biggest fish), and loses a life when eaten by a bigger fish.

## Things to dump for MVP

- Multiple Player lives / respawn — MVP is one life, eaten = game over.
- Special fish (poison, jellyfish stun, bonus golden fish) — MVP has only plain smaller/bigger fish.
- Predator that actively chases the Player — MVP fish all swim in straight lines, no AI tracking.
- Smooth difficulty curve / multiple stages — MVP is a single endless spawn loop, win at target size.
- Size-driven difficulty (spawn pool scaled to Player size) — the original has no such scaling (fixed random pool), so MVP matches it. Late-game threat fade is accepted as faithful-to-original.
- Schooling / flocking movement — MVP fish move independently.
- WASD keys — MVP is arrow-keys only.
- Swim-wiggle sprite animation — MVP uses a single static fish sprite scaled by size.
- Distinct death SFX / background bubbles — MVP reuses one gulp SFX for both eat and being-eaten.
- Mobile support — MVP is keyboard-only desktop. Cross-platform later via a virtual joystick (same velocity model as keyboard, so the dodge feel carries over) + responsive canvas. Workload TBD before committing.

## Logics I learned from previous games

- AABB collision detection — flappy getRect/hits. Reuse for fish-vs-fish overlap.
- Game state flow (READY/PLAY/OVER) + reset — flappy. Reuse for the round loop.
- Scene flow & win/lose transitions — gold-miner scenes (Game / GameOver / GameComplete).
- Score + HUD via registry — gold-miner registry.ts + Hud.ts.
- Sprite-frame animation — flappy Bird frame ticking. Reuse for the fish swim wiggle.
- Per-entity update(dt) over an array of entities — gold-miner minables. Reuse for the fish list.
- Velocity integration (pos += speed * dt) — flappy gravity loop. Reuse for fish drift.

## Core logics to learn

- Size-compare eat/grow mechanic — on overlap, smaller fish gets eaten, Player scale grows on eat, Player dies if the other fish is bigger. (the core new thing)
- Keyboard velocity movement — read held arrow/WASD keys into a velocity vector, integrate into position (clamp to the screen), with horizontal sprite flip toward facing direction. Precise, predictable movement is what makes the narrow-dodge feel work. (Builds on flappy's velocity loop, but player-driven instead of gravity.)
- Off-screen spawner — spawn fish at a random edge with random size/speed/direction, despawn when fully off the opposite side.

## Artworks

- Friendly: one fish sprite scaled by size works for the whole food chain; color/shape variants are a bonus, not a blocker.
- itch.io free game assets (fish sprite packs).

## Sounds

- https://pixabay.com/sound-effects/ — chomp/eat SFX, death SFX, background bubbles.

## Feedbacks

- Control decision: keyboard (velocity-based) over pointer-follow on purpose — pointer chasing feels floaty and kills the precise hitbox-dodging that is this game's essence. Mobile, if pursued, should reuse the same velocity model via a virtual joystick, not pointer-follow.
- Difficulty decision: no size-driven spawn scaling — the original Flash game uses a fixed random size pool (random(72)+2) regardless of Player size, so MVP stays faithful. Trade-off: once the Player outgrows the max spawn size, late-game threat fades. Accepted for MVP; revisit only if a difficulty curve is added later.
