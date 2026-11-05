import { Point } from '../../entities/point.entity.js';
import { PointScope, type PointScopeValue } from '../../enums/point-scope.enum.js';
import type { PointTypeValue } from '../../enums/point-type.enum.js';

/**
 * Point as returned by /api/operator/points: the company's own points (scope COMPANY) and
 * the shared ones it may use (scope SYSTEM, read only). Other companies are not exposed.
 */
export type OperatorPoint = {
  id: string;
  company_uuid: string | null;
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
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function normalizePointCode(value: string) {
  return value.trim().toUpperCase();
}

function pointScope(point: Point): PointScopeValue {
  return point.scope ?? (point.company_id ? PointScope.COMPANY : PointScope.SYSTEM);
}

export function toOperatorPoint(point: Point): OperatorPoint {
  const scope = pointScope(point);
  return {
    id: point.uuid,
    company_uuid: point.company?.uuid ?? null,
    scope,
    shared: scope === PointScope.SYSTEM,
    point_code: normalizePointCode(point.point_code),
    name: point.name,
    point_type: point.point_type ?? '',
    province_uuid: point.province?.uuid ?? null,
    province_name: point.province?.name ?? null,
    ward_uuid: point.ward?.uuid ?? null,
    ward_name: point.ward?.name ?? null,
    address: point.address ?? '',
    note: point.note ?? '',
    is_active: point.is_active,
    created_by: point.created_by,
    updated_by: point.updated_by,
    created_at: point.created_at,
    updated_at: point.updated_at,
  };
}
