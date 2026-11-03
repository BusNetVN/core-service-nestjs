import { Injectable } from '@nestjs/common';
import { UpdateRouteDto } from '../dto/update-route.dto.js';
import { Route } from '../entities/route.entity.js';
import {
  normalizeRouteCode,
  routeNameFromEndpoints,
  toPublicRoute,
} from '../mappers/route.mapper.js';
import { RouteRepository } from '../repository/route.repository.js';

@Injectable()
export class UpdateRouteUseCase {
  constructor(private readonly routes: RouteRepository) {}

  /** `actorUsername` is the username of the user updating the route. */
  async execute(uuid: string, dto: UpdateRouteDto, actorUsername: string) {
    const route = await this.routes.findByUuid(uuid);
    if (dto.route_code) {
      await this.routes.assertUnique(
        route.company_id,
        normalizeRouteCode(dto.route_code),
        route.id,
      );
    }
    this.routes.merge(route, {
      ...this.definedFields(dto, route),
      updated_by: actorUsername || null,
    });
    const saved = await this.routes.save(route);
    saved.company = route.company;
    return toPublicRoute(saved);
  }

  private definedFields(dto: UpdateRouteDto, current: Route): Partial<Route> {
    const fields: Partial<Route> = {};
    (Object.keys(dto) as Array<keyof UpdateRouteDto>).forEach((key) => {
      const value = dto[key];
      if (value === undefined) {
        return;
      }

      if (key === 'route_code' && typeof value === 'string') {
        fields.route_code = normalizeRouteCode(value);
        return;
      }

      (fields as Record<string, unknown>)[key] = value;
    });

    const origin = fields.origin ?? current.origin;
    const destination = fields.destination ?? current.destination;
    if (dto.name !== undefined) {
      fields.name = dto.name.trim() || routeNameFromEndpoints(origin, destination);
    } else if (fields.origin !== undefined || fields.destination !== undefined) {
      const currentName = routeNameFromEndpoints(current.origin, current.destination);
      if (!current.name.trim() || current.name.trim() === currentName) {
        fields.name = routeNameFromEndpoints(origin, destination);
      }
    }

    return fields;
  }
}
