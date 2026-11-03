export const PointScope = {
  SYSTEM: 'SYSTEM',
  COMPANY: 'COMPANY',
} as const;

export type PointScopeValue = (typeof PointScope)[keyof typeof PointScope];
