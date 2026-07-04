export const MapKeys = {
  Farm: "Farm",
} as const;

export type MapKey = (typeof MapKeys)[keyof typeof MapKeys];

export const DEFAULT_MAP_KEY: MapKey = MapKeys.Farm;
