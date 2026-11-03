import {
  toPublicCompany,
  type PublicCompany,
} from '../../companies/mappers/company.mapper.js';
import { Route } from '../entities/route.entity.js';

export type PublicRoute = {
  id: string;
  company_uuid: string;
  company: PublicCompany;
  route_code: string;
  name: string;
  origin: string;
  destination: string;
  distance_km: number | null;
  duration_minutes: number | null;
  note: string;
  status: boolean;
  sort_order: number;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function normalizeRouteCode(value: string) {
  return value.trim().toUpperCase();
}

export function routeNameFromEndpoints(origin: string, destination: string) {
  return `${origin.trim()} - ${destination.trim()}`.trim();
}

export function toPublicRoute(route: Route): PublicRoute {
  return {
    id: route.uuid,
    company_uuid: route.company.uuid,
    company: toPublicCompany(route.company),
    route_code: normalizeRouteCode(route.route_code),
    name: route.name,
    origin: route.origin,
    destination: route.destination,
    distance_km: route.distance_km ?? null,
    duration_minutes: route.duration_minutes ?? null,
    note: route.note,
    status: route.status,
    sort_order: route.sort_order,
    created_by: route.created_by,
    updated_by: route.updated_by,
    created_at: route.created_at,
    updated_at: route.updated_at,
  };
}
