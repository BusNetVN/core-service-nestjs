import { FareSegment } from '../entities/fare-segment.entity.js';
import { Fare } from '../entities/fare.entity.js';

export type PublicFareSegment = {
  origin_point_uuid: string;
  origin_name: string;
  destination_point_uuid: string;
  destination_name: string;
  price: number;
};

export type PublicFare = {
  id: string;
  company_uuid: string;
  route_uuid: string;
  route: {
    id: string;
    route_code: string;
    name: string;
    origin: string;
    destination: string;
  };
  schedule_uuid: string | null;
  schedule: {
    id: string;
    departure_time: string;
    start_date: string;
    end_date: string;
  } | null;
  seat_map_uuid: string | null;
  seat_map: {
    id: string;
    seat_map_code: string;
    name: string;
  } | null;
  priority: boolean;
  start_date: string;
  end_date: string;
  weekdays: number[];
  segments: PublicFareSegment[];
  created_at: Date;
  updated_at: Date;
};

function dateOnly(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value ?? '').slice(0, 10);
}

export function toPublicFare(fare: Fare): PublicFare {
  const segments = [...(fare.segments ?? [])].sort(
    (left, right) => left.sort_order - right.sort_order,
  );
  return {
    id: fare.uuid,
    company_uuid: fare.company.uuid,
    route_uuid: fare.route.uuid,
    route: {
      id: fare.route.uuid,
      route_code: fare.route.route_code,
      name: fare.route.name,
      origin: fare.route.origin,
      destination: fare.route.destination,
    },
    schedule_uuid: fare.schedule?.uuid ?? null,
    schedule: fare.schedule
      ? {
          id: fare.schedule.uuid,
          departure_time: String(fare.schedule.departure_time).slice(0, 5),
          start_date: dateOnly(fare.schedule.start_date),
          end_date: dateOnly(fare.schedule.end_date),
        }
      : null,
    seat_map_uuid: fare.seat_map?.uuid ?? null,
    seat_map: fare.seat_map
      ? {
          id: fare.seat_map.uuid,
          seat_map_code: fare.seat_map.seat_map_code,
          name: fare.seat_map.name,
        }
      : null,
    priority: fare.priority,
    start_date: dateOnly(fare.start_date),
    end_date: dateOnly(fare.end_date),
    weekdays: [...(fare.weekdays ?? [])].sort((left, right) => left - right),
    segments: segments.map(toPublicSegment),
    created_at: fare.created_at,
    updated_at: fare.updated_at,
  };
}

function toPublicSegment(segment: FareSegment): PublicFareSegment {
  return {
    origin_point_uuid: segment.origin_point.uuid,
    origin_name: segment.origin_point.name,
    destination_point_uuid: segment.destination_point.uuid,
    destination_name: segment.destination_point.name,
    price: segment.price,
  };
}
