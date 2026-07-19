export const DIRECTION = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  UP: 'UP',
  DOWN: 'DOWN',
  NONE: 'NONE',
  UPLEFT: 'UPLEFT',
  UPRIGHT: 'UPRIGHT',
  DOWNLEFT: 'DOWNLEFT',
  DOWNRIGHT: 'DOWNRIGHT'
} as const

export interface TilePos {
  col: number
  row: number
}

export interface WorldPos {
  x: number
  y: number
}

export type DirectionOrNone = (typeof DIRECTION)[keyof typeof DIRECTION]
export type Direction = Exclude<DirectionOrNone, typeof DIRECTION.NONE>
