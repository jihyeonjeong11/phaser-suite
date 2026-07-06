export const AUDIO_KEYS = {
  BGM: "bgm",
  GUNFIRE: "gunfire",
  PICKAXE: "pickaxe",
  AXE: "axe",
  HOE: "hoe",
  WATERING: "watering",
} as const;

export type AudioKey = (typeof AUDIO_KEYS)[keyof typeof AUDIO_KEYS];
