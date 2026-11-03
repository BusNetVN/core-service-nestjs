import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Point } from '../../points/entities/point.entity.js';
import { RoutePoint } from '../entities/route-point.entity.js';

const ROUTE_POINT_RELATIONS = {
  point: {
    province: true,
    ward: true,
  },
} as const;

@Injectable()
export class RoutePointRepository {
  constructor(
    @InjectRepository(RoutePoint)
    private readonly routePoints: Repository<RoutePoint>,
  ) {}

  findByRouteId(routeId: string) {
    return this.routePoints.find({
      where: { route_id: routeId },
      relations: ROUTE_POINT_RELATIONS,
      order: { sort_order: 'ASC' },
    });
  }

  async replace(
    routeId: string,
    items: Array<{ point: Point; duration_minutes: number }>,
  ) {
    await this.routePoints.manager.transaction(async (manager) => {
      await manager.delete(RoutePoint, { route_id: routeId });
      if (items.length === 0) {
        return;
      }

      const rows = items.map((item, index) =>
        manager.create(RoutePoint, {
          uuid: crypto.randomUUID(),
          route_id: routeId,
          point_id: item.point.id,
          sort_order: index,
          duration_minutes: index === 0 ? 0 : item.duration_minutes,
        }),
      );
      await manager.save(rows);
    });

    return this.findByRouteId(routeId);
  }
}
