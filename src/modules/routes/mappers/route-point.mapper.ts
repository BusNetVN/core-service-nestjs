import { PointScope } from '../../points/enums/point-scope.enum.js';
import type { PointTypeValue } from '../../points/enums/point-type.enum.js';
import { normalizePointCode } from '../../points/mappers/operator/operator-point.mapper.js';
import { RoutePoint } from '../entities/route-point.entity.js';

export type PublicRoutePointDetail = {
  id: string;
  point_code: string;
  name: string;
  point_type: PointTypeValue | '';
  address: string;
  ward_name: string | null;
  province_name: string | null;
  shared: boolean;
  is_active: boolean;
};

export type PublicRoutePoint = {
  id: string;
  sort_order: number;
  duration_minutes: number;
  point: PublicRoutePointDetail;
};

export function toPublicRoutePoint(routePoint: RoutePoint): PublicRoutePoint {
  const point = routePoint.point;
  const scope = point.scope ?? (point.company_id ? PointScope.COMPANY : PointScope.SYSTEM);
  return {
    id: routePoint.uuid,
    sort_order: routePoint.sort_order,
    duration_minutes: routePoint.duration_minutes,
    point: {
      id: point.uuid,
      point_code: normalizePointCode(point.point_code),
      name: point.name,
      point_type: point.point_type ?? '',
      address: point.address ?? '',
      ward_name: point.ward?.name ?? null,
      province_name: point.province?.name ?? null,
      shared: scope === PointScope.SYSTEM,
      is_active: point.is_active,
    },
  };
}
