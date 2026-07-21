// todo: need to be json afterwards
//
export const TEMP_ENEMIES = {
  zombie: {
    name: 'zombie',
    textureKey: 'zombies',
    frame: 0,
    scale: 1.5,
    hp: 100,
    baseSpeed: 0.5
  }
} as const

export type EnemyKey = keyof typeof TEMP_ENEMIES
export type EnemyDef = (typeof TEMP_ENEMIES)[EnemyKey]
