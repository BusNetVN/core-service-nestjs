import { BadRequestException } from '@nestjs/common';
import { FareSegmentDto } from '../dto/fare-segment.dto.js';
import { RoutePointRepository } from '../../routes/repository/route-point.repository.js';

export async function resolveFareSegments(
  routePoints: RoutePointRepository,
  routeId: string,
  segments: FareSegmentDto[],
) {
  const stops = await routePoints.findByRouteId(routeId);
  if (stops.length < 2) {
    throw new BadRequestException(
      'Tuyến cần ít nhất hai điểm dừng để cấu hình giá.',
    );
  }

  const byUuid = new Map(stops.map((stop) => [stop.point.uuid, stop]));
  const seen = new Set<string>();
  const resolved = segments.map((segment) => {
    const origin = byUuid.get(segment.origin_point_uuid);
    const destination = byUuid.get(segment.destination_point_uuid);
    if (!origin || !destination) {
      throw new BadRequestException('Điểm đi hoặc điểm đến không thuộc tuyến.');
    }
    if (origin.sort_order >= destination.sort_order) {
      throw new BadRequestException('Nơi đến phải nằm sau nơi đi trên tuyến.');
    }
    const key = `${origin.point.id}:${destination.point.id}`;
    if (seen.has(key)) {
      throw new BadRequestException('Bảng giá có chặng bị trùng.');
    }
    seen.add(key);
    return {
      origin_point_id: origin.point.id,
      destination_point_id: destination.point.id,
      price: segment.price,
      origin_order: origin.sort_order,
      destination_order: destination.sort_order,
    };
  });

  resolved.sort(
    (left, right) =>
      left.origin_order - right.origin_order ||
      left.destination_order - right.destination_order,
  );

  return resolved.map((segment, index) => ({
    origin_point_id: segment.origin_point_id,
    destination_point_id: segment.destination_point_id,
    price: segment.price,
    sort_order: index,
  }));
}

export function assertDateRange(startDate: string, endDate: string) {
  const start = startDate.slice(0, 10);
  const end = endDate.slice(0, 10);
  if (start > end) {
    throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu.');
  }
  return { start_date: start, end_date: end };
}

export function normalizeWeekdays(weekdays: number[]) {
  return [...new Set(weekdays)].sort((left, right) => left - right);
}
