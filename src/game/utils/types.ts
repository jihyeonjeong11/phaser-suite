export const HookState = {
  SWINGING: "SWINGING",
  FIRING: "FIRING",
  REELING: "REELING",
  RETURNING: "RETURNING",
} as const;

export type HookStateType = (typeof HookState)[keyof typeof HookState];
