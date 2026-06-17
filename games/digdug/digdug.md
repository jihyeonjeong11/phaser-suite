A game-clone design preps.

## Title

Dig Dug

## References

https://www.retrogames.cz/play_012-NES.php

https://retroarcadememories.wordpress.com/arcade-games-reviews/dig-dug/

## Genre and Concepts

- Arcade
- A Player character can dig through caves
- A Player can shoot projectiles and hit entities
- A Player can repeat shoot action to inflate hit entities, eventually destroy the entity.
- An inflated entity deflates back to normal and resumes attacking if the Player stops pumping.
- A Player can make a rock fall when dig right under of it.
- A fallen rock crushes and destroys entities; one rock that crushes multiple entities grants a bonus multiplier.
- A Player can also be crushed and killed by a falling rock.
- There are two entity types: Pooka (inflate only) and Fygar (inflates, and breathes fire in a straight horizontal line).
- After losing sight of the Player for a few seconds, an entity becomes a ghost and moves through dirt to chase the Player.
- A Player can finish the level when all entities are destroyed.
- A Player loses his life when collides with entities, or their projectile.(Dragon's breath)
- Destroying an entity deeper underground awards more points; destroying a Fygar horizontally scores double.
- Clearing a level advances to the next, harder level (more/faster entities).

## Things to dump for MVP

- Fygar (fire-breathing entity) and its fire projectile — MVP ships one entity type (Pooka only).
- Ghost mode (entities moving through dirt) — MVP entities only chase through dug tunnels.
- Depth-based scoring and the Fygar horizontal double-score bonus — MVP uses flat scoring.
- Level progression / increasing difficulty — MVP is a single level, clear = win.
- Inflated entity deflating back over time — MVP can pop on enough pumps without deflation.

## Logics I learned from previous games

- Directional projectile firing — gold-miner Hook (FIRING/REELING along a sin/cos direction). Reuse for the pump shot.
- State machine pattern — gold-miner HookState switch in update(dt). Reuse for player/entity states.
- Rock gravity / falling — flappy (speed += gravity; y += speed). Reuse for falling rocks.
- AABB collision detection — flappy getRect/hits. Reuse for rock-vs-entity, entity-vs-player.
- Game state flow (READY/PLAY/OVER) + reset — flappy. Reuse for the round loop.
- Scene flow & win/lose transitions — gold-miner scenes (Game / GameOver / GameComplete).
- Score + HUD via registry — gold-miner registry.ts + Hud.ts.
- Sprite-frame animation — flappy Bird frame ticking. Reuse for walk/dig animation.

## Core logics to learn

- Tile grid + dirt carving — 2D dirt/empty array, clear the cell the player enters, render the dirt. (the core new thing)
- Grid-aligned 4-direction keyboard movement + facing direction.
- Inflation counter on an entity — count repeated pump hits, pop at a threshold (built on the known state machine).
- Rock fall trigger — detect when the supporting dirt under a rock is removed, then start the fall.
- Enemy tunnel-following chase AI — entity moves along dug tunnels toward the player (grid chase / BFS). (the biggest new thing)

## Artworks

- Bottleneck: Needs Sprites for inflation!!!!

## Sounds

## Feedbacks
