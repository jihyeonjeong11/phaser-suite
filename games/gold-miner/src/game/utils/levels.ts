import { LevelTemplate } from "./types";

export const getLevelGoal = (level: number): number =>
  135 * level * level + 140 * level + 375;

export const LEVEL_TEMPLATES: Record<number, LevelTemplate[]> = {
  1: [
    {
      // 템플릿 A — 어두운 갈색 지형
      minables: [
        { type: "GOLD_SMALL",   nx: 0.20, ny: 0.19 },
        { type: "ROCK_SMALL",   nx: 0.13, ny: 0.31 },
        { type: "ROCK_LARGE",   nx: 0.85, ny: 0.19 },
        { type: "GOLD_SMALL",   nx: 0.33, ny: 0.36 },
        { type: "GOLD_SMALL",   nx: 0.58, ny: 0.37 },
        { type: "GOLD_SMALL",   nx: 0.75, ny: 0.37 },
        { type: "GOLD_SMALL",   nx: 0.78, ny: 0.47 },
        { type: "GOLD_LARGE",   nx: 0.13, ny: 0.50 },
        { type: "ROCK_LARGE",   nx: 0.73, ny: 0.57 },
        { type: "GOLD_LARGE",   nx: 0.93, ny: 0.58 },
        { type: "GOLD_MEDIUM",  nx: 0.44, ny: 0.68 },
        { type: "GOLD_SMALL",   nx: 0.23, ny: 0.76 },
        { type: "ROCK_SMALL",   nx: 0.31, ny: 0.89 },
        { type: "MYSTERY_BAG",  nx: 0.66, ny: 0.89 },
      ],
    },
    {
      // 템플릿 B — 밝은 갈색 지형
      minables: [
        { type: "MYSTERY_BAG",  nx: 0.12, ny: 0.23 },
        { type: "ROCK_SMALL",   nx: 0.19, ny: 0.21 },
        { type: "ROCK_LARGE",   nx: 0.77, ny: 0.19 },
        { type: "GOLD_SMALL",   nx: 0.76, ny: 0.30 },
        { type: "GOLD_SMALL",   nx: 0.23, ny: 0.37 },
        { type: "GOLD_SMALL",   nx: 0.58, ny: 0.37 },
        { type: "GOLD_SMALL",   nx: 0.68, ny: 0.35 },
        { type: "MYSTERY_BAG",  nx: 0.75, ny: 0.41 },
        { type: "GOLD_SMALL",   nx: 0.32, ny: 0.54 },
        { type: "GOLD_LARGE",   nx: 0.20, ny: 0.57 },
        { type: "ROCK_LARGE",   nx: 0.65, ny: 0.63 },
        { type: "GOLD_LARGE",   nx: 0.59, ny: 0.74 },
        { type: "ROCK_SMALL",   nx: 0.46, ny: 0.82 },
        { type: "GOLD_SMALL",   nx: 0.95, ny: 0.80 },
        { type: "GOLD_SMALL",   nx: 0.17, ny: 0.90 },
      ],
    },
  ],
  2: [
    {
      // 템플릿 A — 왼쪽 바위 군집, 오른쪽 금 군집
      minables: [
        { type: "ROCK_LARGE",   nx: 0.15, ny: 0.16 },
        { type: "MYSTERY_BAG",  nx: 0.13, ny: 0.29 },
        { type: "GOLD_SMALL",   nx: 0.59, ny: 0.18 },
        { type: "GOLD_SMALL",   nx: 0.79, ny: 0.18 },
        { type: "ROCK_SMALL",   nx: 0.06, ny: 0.41 },
        { type: "ROCK_LARGE",   nx: 0.32, ny: 0.37 },
        { type: "GOLD_SMALL",   nx: 0.66, ny: 0.40 },
        { type: "GOLD_SMALL",   nx: 0.78, ny: 0.40 },
        { type: "GOLD_SMALL",   nx: 0.88, ny: 0.46 },
        { type: "ROCK_SMALL",   nx: 0.06, ny: 0.59 },
        { type: "ROCK_LARGE",   nx: 0.32, ny: 0.57 },
        { type: "GOLD_MEDIUM",  nx: 0.58, ny: 0.56 },
        { type: "GOLD_MEDIUM",  nx: 0.67, ny: 0.61 },
        { type: "GOLD_MEDIUM",  nx: 0.76, ny: 0.59 },
        { type: "GOLD_SMALL",   nx: 0.88, ny: 0.59 },
        { type: "ROCK_SMALL",   nx: 0.21, ny: 0.71 },
        { type: "GOLD_SMALL",   nx: 0.59, ny: 0.71 },
        { type: "GOLD_SMALL",   nx: 0.76, ny: 0.74 },
        { type: "GOLD_LARGE",   nx: 0.10, ny: 0.82 },
        { type: "ROCK_SMALL",   nx: 0.20, ny: 0.88 },
        { type: "GOLD_SMALL",   nx: 0.76, ny: 0.85 },
        { type: "GOLD_LARGE",   nx: 0.88, ny: 0.81 },
      ],
    },
    {
      // 템플릿 B — 바위 중앙 분산, 미스터리백 중앙
      minables: [
        { type: "GOLD_SMALL",   nx: 0.07, ny: 0.30 },
        { type: "GOLD_SMALL",   nx: 0.11, ny: 0.31 },
        { type: "ROCK_LARGE",   nx: 0.17, ny: 0.37 },
        { type: "GOLD_SMALL",   nx: 0.62, ny: 0.19 },
        { type: "GOLD_SMALL",   nx: 0.78, ny: 0.18 },
        { type: "ROCK_LARGE",   nx: 0.72, ny: 0.25 },
        { type: "GOLD_SMALL",   nx: 0.33, ny: 0.53 },
        { type: "ROCK_SMALL",   nx: 0.05, ny: 0.59 },
        { type: "ROCK_LARGE",   nx: 0.30, ny: 0.58 },
        { type: "GOLD_MEDIUM",  nx: 0.70, ny: 0.58 },
        { type: "GOLD_SMALL",   nx: 0.86, ny: 0.48 },
        { type: "ROCK_SMALL",   nx: 0.21, ny: 0.71 },
        { type: "ROCK_LARGE",   nx: 0.42, ny: 0.65 },
        { type: "ROCK_LARGE",   nx: 0.54, ny: 0.64 },
        { type: "GOLD_SMALL",   nx: 0.66, ny: 0.74 },
        { type: "GOLD_SMALL",   nx: 0.86, ny: 0.75 },
        { type: "MYSTERY_BAG",  nx: 0.46, ny: 0.77 },
        { type: "GOLD_LARGE",   nx: 0.09, ny: 0.85 },
        { type: "GOLD_LARGE",   nx: 0.30, ny: 0.86 },
        { type: "GOLD_SMALL",   nx: 0.88, ny: 0.85 },
      ],
    },
  ],
  3: [
    {
      // 목표 $2,010 / 금 희소, 다이아몬드 첫 등장, 바위 다수
      minables: [
        { type: "GOLD_SMALL",   nx: 0.18, ny: 0.15 },
        { type: "GOLD_SMALL",   nx: 0.23, ny: 0.17 },
        { type: "GOLD_SMALL",   nx: 0.18, ny: 0.24 },
        { type: "MYSTERY_BAG",  nx: 0.14, ny: 0.31 },
        { type: "ROCK_LARGE",   nx: 0.46, ny: 0.36 },
        { type: "GOLD_SMALL",   nx: 0.67, ny: 0.40 },
        { type: "ROCK_LARGE",   nx: 0.86, ny: 0.35 },
        { type: "GOLD_SMALL",   nx: 0.91, ny: 0.40 },
        { type: "GOLD_MEDIUM",  nx: 0.12, ny: 0.53 },
        { type: "ROCK_LARGE",   nx: 0.73, ny: 0.48 },
        { type: "ROCK_SMALL",   nx: 0.19, ny: 0.64 },
        { type: "ROCK_LARGE",   nx: 0.58, ny: 0.59 },
        { type: "GOLD_SMALL",   nx: 0.22, ny: 0.73 },
        { type: "ROCK_SMALL",   nx: 0.63, ny: 0.71 },
        { type: "DIAMOND",      nx: 0.76, ny: 0.71 },
        { type: "ROCK_LARGE",   nx: 0.87, ny: 0.66 },
        { type: "GOLD_LARGE",   nx: 0.51, ny: 0.84 },
      ],
    },
  ],
};
