export const MapKeys = {
  Farm: "Farm",
  Ruin: "Ruin",
  Cliff: "Cliff",
} as const;

export type MapKey = (typeof MapKeys)[keyof typeof MapKeys];

export const DEFAULT_MAP_KEY: MapKey = MapKeys.Cliff;
