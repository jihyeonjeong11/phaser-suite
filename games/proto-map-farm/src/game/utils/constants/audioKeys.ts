export const AUDIO_KEYS = {
  BGM: "bgm",
  GUNFIRE: "gunfire",
  PICKAXE_HIT: "pickaxe_hit",
} as const;

export type AudioKey = (typeof AUDIO_KEYS)[keyof typeof AUDIO_KEYS];
