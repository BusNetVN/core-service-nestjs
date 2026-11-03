export const SessionRevokeReason = {
  LOGOUT: 'LOGOUT',
  /** A rotated (already used) refresh token was presented again. */
  TOKEN_REUSED: 'TOKEN_REUSED',
  USER_INACTIVE: 'USER_INACTIVE',
} as const;

export type SessionRevokeReasonValue =
  (typeof SessionRevokeReason)[keyof typeof SessionRevokeReason];
