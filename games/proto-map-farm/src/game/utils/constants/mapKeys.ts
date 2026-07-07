export const MAP_KEYS = {
  FARM: "Farm",
  RUIN: "Ruin",
  CLIFF: "Cliff",
  HOME: "Home",
} as const;

export type MapKey = (typeof MAP_KEYS)[keyof typeof MAP_KEYS];

export const DEFAULT_MAP_KEY: MapKey = MAP_KEYS.CLIFF;
