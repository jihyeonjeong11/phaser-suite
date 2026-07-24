export const MAP_KEYS = {
  FARM: "Farm",
  RUIN: "Ruin",
  CLIFF: "Cliff",
  HOME: "Home",
  TEST: "Test",
} as const;

export type MapKey = (typeof MAP_KEYS)[keyof typeof MAP_KEYS];

// TEMP: 직접 그린 farm_tiles 4종 타일 느낌 테스트용. 확인 끝나면 CLIFF로 되돌릴 것.
export const DEFAULT_MAP_KEY: MapKey = MAP_KEYS.TEST;
