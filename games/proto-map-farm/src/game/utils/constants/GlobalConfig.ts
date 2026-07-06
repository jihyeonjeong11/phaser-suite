// 세이브 상위 글로벌 config

const GLOBAL_CONFIG_KEY = "proto-map-farm-config";

export const GLOBAL_CONFIGS = {
  VOLUME: "volume",
} as const;

export const DEFAULT_CONFIGS = {
  BGM_VOLUME: 0.4,
} as const;

export interface GlobalConfig {
  [GLOBAL_CONFIGS.VOLUME]: number;
}

const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  [GLOBAL_CONFIGS.VOLUME]: DEFAULT_CONFIGS.BGM_VOLUME,
};

function read(): GlobalConfig {
  const raw = localStorage.getItem(GLOBAL_CONFIG_KEY);
  if (!raw) {
    localStorage.setItem(
      GLOBAL_CONFIG_KEY,
      JSON.stringify(DEFAULT_GLOBAL_CONFIG),
    );
    return { ...DEFAULT_GLOBAL_CONFIG };
  }
  try {
    return { ...DEFAULT_GLOBAL_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_GLOBAL_CONFIG };
  }
}

function write(patch: Partial<GlobalConfig>): GlobalConfig {
  const next = { ...read(), ...patch };
  localStorage.setItem(GLOBAL_CONFIG_KEY, JSON.stringify(next));
  return next;
}

export const globalConfig = {
  getVolume(): number {
    return read()[GLOBAL_CONFIGS.VOLUME];
  },
  setVolume(volume: number): void {
    write({ [GLOBAL_CONFIGS.VOLUME]: volume });
  },
};
