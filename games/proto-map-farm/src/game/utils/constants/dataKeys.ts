export const DATA_KEYS = {
  ANIMATIONS: 'animations'
} as const

export type DataKey = (typeof DATA_KEYS)[keyof typeof DATA_KEYS]
