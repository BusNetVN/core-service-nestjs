import { BadRequestException, Injectable } from '@nestjs/common';
import { PointRepository } from '../../points/repository/point.repository.js';
import { ReplaceRoutePointsDto } from '../dto/replace-route-points.dto.js';
import { toPublicRoutePoint } from '../mappers/route-point.mapper.js';
import { RouteRepository } from '../repository/route.repository.js';
import { RoutePointRepository } from '../repository/route-point.repository.js';

@Injectable()
export class ReplaceRoutePointsUseCase {
  constructor(
    private readonly routes: RouteRepository,
    private readonly routePoints: RoutePointRepository,
    private readonly points: PointRepository,
  ) {}

  async execute(routeUuid: string, dto: ReplaceRoutePointsDto) {
    const route = await this.routes.findByUuid(routeUuid);
    const uuids = dto.stops.map((item) => item.point_uuid);
    if (new Set(uuids).size !== uuids.length) {
      throw new BadRequestException('Điểm dừng bị trùng trên tuyến.');
    }

    const found = await this.points.findUsableByUuids(route.company_id, uuids);
    if (found.length !== uuids.length) {
      throw new BadRequestException(
        'Có điểm dừng không dùng được cho nhà xe này.',
      );
    }

    const byUuid = new Map(found.map((point) => [point.uuid, point]));
    const saved = await this.routePoints.replace(
      route.id,
      dto.stops.map((item) => ({
        point: byUuid.get(item.point_uuid)!,
        duration_minutes: item.duration_minutes,
      })),
    );
    return saved.map(toPublicRoutePoint);
  }
}
