import { BadRequestException, Injectable } from '@nestjs/common';
import { RouteRepository } from '../../routes/repository/route.repository.js';
import { SeatMapRepository } from '../../seat-maps/repository/seat-map.repository.js';
import { UpdateScheduleDto } from '../dto/update-schedule.dto.js';
import { Schedule } from '../entities/schedule.entity.js';
import {
  normalizeDepartureTime,
  normalizeWeekdayMode,
  normalizeWeekdays,
  orderedDates,
  toPublicSchedule,
} from '../mappers/schedule.mapper.js';
import { ScheduleRepository } from '../repository/schedule.repository.js';

@Injectable()
export class UpdateScheduleUseCase {
  constructor(
    private readonly schedules: ScheduleRepository,
    private readonly routes: RouteRepository,
    private readonly seatMaps: SeatMapRepository,
  ) {}

  async execute(uuid: string, dto: UpdateScheduleDto) {
    const schedule = await this.schedules.findByUuid(uuid);
    this.schedules.merge(schedule, await this.definedFields(dto, schedule));
    const saved = await this.schedules.save(schedule);
    saved.company = schedule.company;
    saved.route = schedule.route;
    saved.seat_map = schedule.seat_map;
    return toPublicSchedule(saved);
  }

  private async definedFields(
    dto: UpdateScheduleDto,
    current: Schedule,
  ): Promise<Partial<Schedule>> {
    const fields: Partial<Schedule> = {};

    if (dto.route_uuid) {
      const route = await this.routes.findByUuid(dto.route_uuid);
      if (route.company_id !== current.company_id) {
        throw new BadRequestException('Tuyến đường không thuộc nhà xe.');
      }
      fields.route_id = route.id;
      fields.route = route;
    }

    if (dto.seat_map_uuid) {
      const seatMap = await this.seatMaps.findByUuid(dto.seat_map_uuid);
      if (seatMap.company_id !== current.company_id) {
        throw new BadRequestException('Sơ đồ ghế không thuộc nhà xe.');
      }
      fields.seat_map_id = seatMap.id;
      fields.seat_map = seatMap;
    }

    if (dto.start_date !== undefined || dto.end_date !== undefined) {
      const dates = orderedDates(
        dto.start_date ?? current.start_date,
        dto.end_date ?? current.end_date,
      );
      fields.start_date = dates.start_date;
      fields.end_date = dates.end_date;
    }

    if (dto.departure_time !== undefined) {
      fields.departure_time = normalizeDepartureTime(dto.departure_time);
    }

    if (dto.weekday_mode !== undefined || dto.weekdays !== undefined) {
      const weekdayMode = normalizeWeekdayMode(
        dto.weekday_mode ?? current.weekday_mode,
      );
      fields.weekday_mode = weekdayMode;
      fields.weekdays = normalizeWeekdays(
        weekdayMode,
        dto.weekdays ?? current.weekdays,
      );
    }

    if (dto.note !== undefined) {
      fields.note = dto.note.trim();
    }

    if (dto.status !== undefined) {
      fields.status = dto.status;
    }

    return fields;
  }
}
