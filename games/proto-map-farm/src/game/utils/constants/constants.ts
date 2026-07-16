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

export interface POS {
  col: number
  row: number
}

// 입력 결과 포함(NONE 포함) — controls가 반환하는 값의 타입.
export type DirectionOrNone = (typeof DIRECTION)[keyof typeof DIRECTION]
// 실제 바라보는 방향(NONE 제외) — 저장/타겟팅에 쓰는 타입.
export type Direction = Exclude<DirectionOrNone, typeof DIRECTION.NONE>
