import {
  toPublicCompany,
  type PublicCompany,
} from '../../companies/mappers/company.mapper.js';
import { Point } from '../entities/point.entity.js';
import { PointScope, type PointScopeValue } from '../enums/point-scope.enum.js';
import type { PointTypeValue } from '../enums/point-type.enum.js';

export type PublicPointCompany = {
  id: string;
  name: string;
  short_name: string;
  company_code: string;
};

export type PublicPoint = {
  id: string;
  company_uuid: string | null;
  company: PublicCompany | null;
  scope: PointScopeValue;
  shared: boolean;
  point_code: string;
  name: string;
  point_type: PointTypeValue | '';
  province_uuid: string | null;
  province_name: string | null;
  ward_uuid: string | null;
  ward_name: string | null;
  address: string;
  note: string;
  allowed_companies: PublicPointCompany[];
  status: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function normalizePointCode(value: string) {
  return value.trim().toUpperCase();
}

export function toPublicPoint(point: Point): PublicPoint {
  return {
    id: point.uuid,
    company_uuid: point.company?.uuid ?? null,
    company: point.company ? toPublicCompany(point.company) : null,
    scope: point.scope ?? (point.company_id ? PointScope.COMPANY : PointScope.SYSTEM),
    shared: (point.scope ?? (point.company_id ? PointScope.COMPANY : PointScope.SYSTEM)) === PointScope.SYSTEM,
    point_code: normalizePointCode(point.point_code),
    name: point.name,
    point_type: point.point_type ?? '',
    province_uuid: point.province?.uuid ?? null,
    province_name: point.province?.name ?? null,
    ward_uuid: point.ward?.uuid ?? null,
    ward_name: point.ward?.name ?? null,
    address: point.address ?? '',
    note: point.note ?? '',
    allowed_companies: [...(point.allowed_companies ?? [])]
      .sort((left, right) => left.name.localeCompare(right.name, 'vi'))
      .map((company) => ({
        id: company.uuid,
        name: company.name,
        short_name: company.short_name,
        company_code: company.company_code,
      })),
    status: point.status,
    created_by: point.created_by,
    updated_by: point.updated_by,
    created_at: point.created_at,
    updated_at: point.updated_at,
  };
}
