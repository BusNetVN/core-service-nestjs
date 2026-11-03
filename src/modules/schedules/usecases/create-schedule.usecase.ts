import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { RouteRepository } from '../../routes/repository/route.repository.js';
import { SeatMapRepository } from '../../seat-maps/repository/seat-map.repository.js';
import { CreateScheduleDto } from '../dto/create-schedule.dto.js';
import {
  normalizeDepartureTime,
  normalizeWeekdayMode,
  normalizeWeekdays,
  orderedDates,
  toPublicSchedule,
} from '../mappers/schedule.mapper.js';
import { ScheduleRepository } from '../repository/schedule.repository.js';

@Injectable()
export class CreateScheduleUseCase {
  constructor(
    private readonly schedules: ScheduleRepository,
    private readonly companies: CompanyRepository,
    private readonly routes: RouteRepository,
    private readonly seatMaps: SeatMapRepository,
  ) {}

  async execute(dto: CreateScheduleDto) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const route = await this.routes.findByUuid(dto.route_uuid);
    const seatMap = await this.seatMaps.findByUuid(dto.seat_map_uuid);

    if (route.company_id !== company.id || seatMap.company_id !== company.id) {
      throw new BadRequestException(
        'Tuyến đường hoặc sơ đồ ghế không thuộc nhà xe.',
      );
    }

    const dates = orderedDates(dto.start_date, dto.end_date);
    const weekdayMode = normalizeWeekdayMode(dto.weekday_mode);
    const schedule = this.schedules.create({
      uuid: crypto.randomUUID(),
      company_id: company.id,
      company,
      route_id: route.id,
      route,
      seat_map_id: seatMap.id,
      seat_map: seatMap,
      start_date: dates.start_date,
      end_date: dates.end_date,
      departure_time: normalizeDepartureTime(dto.departure_time),
      weekday_mode: weekdayMode,
      weekdays: normalizeWeekdays(weekdayMode, dto.weekdays),
      note: dto.note?.trim() ?? '',
      status: dto.status ?? true,
    });
    const saved = await this.schedules.save(schedule);
    saved.company = company;
    saved.route = route;
    saved.seat_map = seatMap;
    return toPublicSchedule(saved);
  }
}
