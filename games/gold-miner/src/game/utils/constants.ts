export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const HUD_H = 110;

export const HOOK_ANCHOR_Y = 80;
export const MINE_PADDING = 50;
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
    textureKey: ["gold", "gold2"] as const,
  },
  GOLD_MEDIUM: {
    weight: 2,
    value: 250,
    radius: 18,
    displaySize: 65,
    textureKey: ["gold", "gold2"] as const,
  },
  GOLD_LARGE: {
    weight: 4,
    value: 500,
    radius: 30,
    displaySize: 100,
    textureKey: ["gold", "gold2"] as const,
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
  MYSTERY_BAG: {
    isRandom: true as const,
    weightRange: [1, 6] as [number, number],
    valueRange: [50, 900] as [number, number],
    radius: 15,
    displaySize: 48,
    textureKey: "bag",
  },
};
