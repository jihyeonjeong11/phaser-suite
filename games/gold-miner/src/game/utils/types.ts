import { MINING_TYPES } from "./constants";

export type MinableEntry = {
  type: keyof typeof MINING_TYPES;
  nx: number;
  ny: number;
};

export type LevelTemplate = {
  minables: MinableEntry[];
};

export const HookState = {
  SWINGING: "SWINGING",
  FIRING: "FIRING",
  REELING: "REELING",
  RETURNING: "RETURNING",
} as const;

export type HookStateType = (typeof HookState)[keyof typeof HookState];
