export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const HOOK_SWING_MAX_ANGLE = 65 * (Math.PI / 180);
export const HOOK_SWING_MIN_ANGLE = 0;
export const HOOK_SWING_SPEED = 1.1;
export const HOOK_FIRE_SPEED = 400;
export const BASE_REEL_SPEED = 280;
export const HOOK_MIN_LEN = 20;

export const MINING_TYPES = {
  GOLD_SMALL: {
    weight: 1,
    value: 100,
    radius: 12,
    displaySize: 43,
    textureKey: "gold",
  },
  GOLD_MEDIUM: {
    weight: 2,
    value: 250,
    radius: 18,
    displaySize: 65,
    textureKey: "gold",
  },
  GOLD_LARGE: {
    weight: 4,
    value: 500,
    radius: 30,
    displaySize: 100,
    textureKey: "gold",
  },
  ROCK_SMALL: {
    weight: 3,
    value: 10,
    radius: 12,
    displaySize: 44,
    textureKey: "rock",
  },
  ROCK_LARGE: {
    weight: 5,
    value: 20,
    radius: 18,
    displaySize: 65,
    textureKey: "rock",
  },
  DIAMOND: {
    weight: 1,
    value: 800,
    radius: 10,
    displaySize: 22,
    textureKey: "diamond",
  },
} as const;
