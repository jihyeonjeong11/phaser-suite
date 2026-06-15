import { getLevelGoal } from "./levels";

export const REG = {
  MONEY: "money",
  TIME: "time",
  LEVEL: "level",
  GOAL: "goal",
} as const;

export const REGISTRY_DEFAULTS = {
  [REG.MONEY]: 0,
  [REG.TIME]: 60,
  [REG.LEVEL]: 1,
  [REG.GOAL]: getLevelGoal(1),
};
