export const PointType = {
  BEN_TAU: 'BEN_TAU',
  BEN_XE: 'BEN_XE',
  DIA_DANH: 'DIA_DANH',
  DOC_DUONG: 'DOC_DUONG',
  KHU_VUC: 'KHU_VUC',
  NHA_GA: 'NHA_GA',
  SAN_BAY: 'SAN_BAY',
  VAN_PHONG: 'VAN_PHONG',
  TRAM_DUNG_CHAN: 'TRAM_DUNG_CHAN',
} as const;

export type PointTypeValue = (typeof PointType)[keyof typeof PointType];

export const POINT_TYPE_VALUES = Object.values(PointType);

export const POINT_TYPE_LABELS: Record<PointTypeValue, string> = {
  BEN_TAU: 'Bến tàu',
  BEN_XE: 'Bến xe',
  DIA_DANH: 'Địa danh',
  DOC_DUONG: 'Dọc đường',
  KHU_VUC: 'Khu vực',
  NHA_GA: 'Nhà ga',
  SAN_BAY: 'Sân bay',
  VAN_PHONG: 'Văn phòng',
  TRAM_DUNG_CHAN: 'Trạm dừng chân',
};
