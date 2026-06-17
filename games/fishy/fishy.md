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
- The spawn mix gets harder over time (more fish, bigger fish).
- A Player wins by reaching a target size (became the biggest fish), and loses a life when eaten by a bigger fish.

## Things to dump for MVP

- Multiple Player lives / respawn — MVP is one life, eaten = game over.
- Special fish (poison, jellyfish stun, bonus golden fish) — MVP has only plain smaller/bigger fish.
- Predator that actively chases the Player — MVP fish all swim in straight lines, no AI tracking.
- Smooth difficulty curve / multiple stages — MVP is a single endless spawn loop, win at target size.
- Schooling / flocking movement — MVP fish move independently.
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
- Size-driven difficulty — the spawn size pool scales with the Player's current size so there's always food and always a threat.

## Artworks

- Friendly: one fish sprite scaled by size works for the whole food chain; color/shape variants are a bonus, not a blocker.
- itch.io free game assets (fish sprite packs).

## Sounds

- https://pixabay.com/sound-effects/ — chomp/eat SFX, death SFX, background bubbles.

## Feedbacks

- Control decision: keyboard (velocity-based) over pointer-follow on purpose — pointer chasing feels floaty and kills the precise hitbox-dodging that is this game's essence. Mobile, if pursued, should reuse the same velocity model via a virtual joystick, not pointer-follow.
