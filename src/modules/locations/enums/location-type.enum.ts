export const ProvinceType = {
  TINH: 'tinh',
  THANH_PHO: 'thanh_pho',
} as const;

export type ProvinceTypeValue =
  (typeof ProvinceType)[keyof typeof ProvinceType];

export const WardType = {
  XA: 'xa',
  PHUONG: 'phuong',
  DAC_KHU: 'dac_khu',
} as const;

export type WardTypeValue = (typeof WardType)[keyof typeof WardType];
