import { Injectable } from '@nestjs/common';
import { toPublicRoutePoint } from '../mappers/route-point.mapper.js';
import { RouteRepository } from '../repository/route.repository.js';
import { RoutePointRepository } from '../repository/route-point.repository.js';

@Injectable()
export class FindRoutePointsUseCase {
  constructor(
    private readonly routes: RouteRepository,
    private readonly routePoints: RoutePointRepository,
  ) {}

  async execute(routeUuid: string) {
    const route = await this.routes.findByUuid(routeUuid);
    const routePoints = await this.routePoints.findByRouteId(route.id);
    return routePoints.map(toPublicRoutePoint);
  }
}
