import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { RouteRepository } from '../../routes/repository/route.repository.js';
import {
  isIsoDate,
  isoWeekday,
  toPublicSchedule,
} from '../mappers/schedule.mapper.js';
import { ScheduleRepository } from '../repository/schedule.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class FindMatchingSchedulesUseCase {
  constructor(
    private readonly schedules: ScheduleRepository,
    private readonly companies: CompanyRepository,
    private readonly routes: RouteRepository,
  ) {}

  async execute(companyUuid?: string, routeUuid?: string, date?: string) {
    if (!companyUuid || !UUID_V4.test(companyUuid)) {
      throw new BadRequestException('Vui lòng chọn nhà xe.');
    }
    if (!routeUuid || !UUID_V4.test(routeUuid)) {
      throw new BadRequestException('Vui lòng chọn tuyến.');
    }
    if (!date || !isIsoDate(date)) {
      throw new BadRequestException('Ngày không hợp lệ.');
    }

    const company = await this.companies.findByUuid(companyUuid);
    const route = await this.routes.findByUuid(routeUuid);
    if (String(route.company_id) !== String(company.id)) {
      throw new BadRequestException('Tuyến không thuộc nhà xe đã chọn.');
    }

    const schedules = await this.schedules.findMatching(
      company.id,
      route.uuid,
      date,
      isoWeekday(date),
    );
    return schedules.map(toPublicSchedule);
  }
}