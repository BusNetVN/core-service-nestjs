import { Injectable } from '@nestjs/common';
import { AdminUpdateRouteDto } from '../../dto/admin/admin-update-route.dto.js';
import { Route } from '../../entities/route.entity.js';
import {
  normalizeRouteCode,
  routeNameFromEndpoints,
  toPublicRoute,
} from '../../mappers/route.mapper.js';
import { RouteRepository } from '../../repository/route.repository.js';

/** Partial update of any route; the company stays unchanged. */
@Injectable()
export class AdminUpdateRouteUseCase {
  constructor(private readonly routes: RouteRepository) {}

  /** `actorUsername` is the username of the admin updating the route. */
  async execute(uuid: string, dto: AdminUpdateRouteDto, actorUsername: string) {
    const route = await this.routes.findByUuid(uuid);
    const fields: Partial<Route> = { updated_by: actorUsername || null };

    if (dto.route_code !== undefined) {
      fields.route_code = normalizeRouteCode(dto.route_code);
      await this.routes.assertUnique(
        route.company_id,
        fields.route_code,
        route.id,
      );
    }
    if (dto.origin !== undefined) fields.origin = dto.origin;
    if (dto.destination !== undefined) fields.destination = dto.destination;
    if (dto.distance_km !== undefined) fields.distance_km = dto.distance_km;
    if (dto.duration_minutes !== undefined) {
      fields.duration_minutes = dto.duration_minutes;
    }
    if (dto.note !== undefined) fields.note = dto.note;
    if (dto.status !== undefined) fields.status = dto.status;

    const origin = fields.origin ?? route.origin;
    const destination = fields.destination ?? route.destination;
    if (dto.name !== undefined) {
      fields.name = dto.name || routeNameFromEndpoints(origin, destination);
    } else if (
      // Keep an auto-generated name in sync with new endpoints; leave custom names alone.
      route.name.trim() === routeNameFromEndpoints(route.origin, route.destination)
    ) {
      fields.name = routeNameFromEndpoints(origin, destination);
    }

    this.routes.merge(route, fields);
    const saved = await this.routes.save(route);
    saved.company = route.company;
    return toPublicRoute(saved);
  }
}
