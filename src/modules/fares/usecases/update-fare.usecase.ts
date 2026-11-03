import { BadRequestException, Injectable } from '@nestjs/common';
import { RoutePointRepository } from '../../routes/repository/route-point.repository.js';
import { RouteRepository } from '../../routes/repository/route.repository.js';
import { ScheduleRepository } from '../../schedules/repository/schedule.repository.js';
import { SeatMapRepository } from '../../seat-maps/repository/seat-map.repository.js';
import { UpdateFareDto } from '../dto/update-fare.dto.js';
import { toPublicFare } from '../mappers/fare.mapper.js';
import { FareRepository } from '../repository/fare.repository.js';
import {
  assertDateRange,
  normalizeWeekdays,
  resolveFareSegments,
} from './resolve-fare-segments.js';

@Injectable()
export class UpdateFareUseCase {
  constructor(
    private readonly fares: FareRepository,
    private readonly routes: RouteRepository,
    private readonly routePoints: RoutePointRepository,
    private readonly schedules: ScheduleRepository,
    private readonly seatMaps: SeatMapRepository,
  ) {}

  async execute(uuid: string, dto: UpdateFareDto) {
    const fare = await this.fares.findByUuid(uuid);
    const route = await this.routes.findByUuid(dto.route_uuid);
    if (route.company_id !== fare.company_id) {
      throw new BadRequestException('Tuyến đường không thuộc nhà xe.');
    }

    const schedule = dto.schedule_uuid
      ? await this.schedules.findByUuid(dto.schedule_uuid)
      : null;
    if (
      schedule &&
      (schedule.company_id !== fare.company_id || schedule.route_id !== route.id)
    ) {
      throw new BadRequestException('Chuyến áp dụng không thuộc tuyến này.');
    }

    const seatMap = dto.seat_map_uuid
      ? await this.seatMaps.findByUuid(dto.seat_map_uuid)
      : null;
    if (seatMap && seatMap.company_id !== fare.company_id) {
      throw new BadRequestException('Sơ đồ ghế không thuộc nhà xe.');
    }

    const dates = assertDateRange(dto.start_date, dto.end_date);
    const segments = await resolveFareSegments(
      this.routePoints,
      route.id,
      dto.segments,
    );
    fare.route_id = route.id;
    fare.route = route;
    fare.schedule_id = schedule?.id ?? null;
    fare.schedule = schedule;
    fare.seat_map_id = seatMap?.id ?? null;
    fare.seat_map = seatMap;
    fare.priority = dto.priority;
    fare.start_date = dates.start_date;
    fare.end_date = dates.end_date;
    fare.weekdays = normalizeWeekdays(dto.weekdays);
    return toPublicFare(await this.fares.save(fare, segments));
  }
}
