import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../entities/schedule.entity.js';

const RELATIONS = {
  company: true,
  route: true,
  seat_map: true,
} as const;

@Injectable()
export class ScheduleRepository {
  constructor(
    @InjectRepository(Schedule)
    private readonly schedules: Repository<Schedule>,
  ) {}

  create(data: Partial<Schedule>) {
    return this.schedules.create(data);
  }

  save(schedule: Schedule) {
    return this.schedules.save(schedule);
  }

  merge(schedule: Schedule, fields: Partial<Schedule>) {
    return this.schedules.merge(schedule, fields);
  }

  remove(schedule: Schedule) {
    return this.schedules.remove(schedule);
  }

  async findByUuid(uuid: string) {
    const schedule = await this.schedules.findOne({
      where: { uuid },
      relations: RELATIONS,
    });
    if (!schedule) {
      throw new NotFoundException('Không tìm thấy lịch chạy.');
    }
    return schedule;
  }

  async findAll(companyId: string, query?: string) {
    const keyword = query?.trim();
    const qb = this.schedules
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.company', 'company')
      .innerJoinAndSelect('schedule.route', 'route')
      .innerJoinAndSelect('schedule.seat_map', 'seat_map')
      .where('schedule.company_id = :companyId', { companyId });

    if (keyword) {
      qb.andWhere(
        `(
          LOWER(route.route_code) LIKE :q
          OR LOWER(route.name) LIKE :q
          OR LOWER(route.origin) LIKE :q
          OR LOWER(route.destination) LIKE :q
          OR LOWER(seat_map.seat_map_code) LIKE :q
          OR LOWER(seat_map.name) LIKE :q
          OR LOWER(schedule.note) LIKE :q
        )`,
        { q: `%${keyword.toLowerCase()}%` },
      );
    }

    return qb
      .orderBy('schedule.start_date', 'DESC')
      .addOrderBy('schedule.created_at', 'DESC')
      .getMany();
  }

  findMatching(companyId: string, routeUuid: string, date: string, weekday: number) {
    return this.schedules
      .createQueryBuilder('schedule')
      .innerJoinAndSelect('schedule.company', 'company')
      .innerJoinAndSelect('schedule.route', 'route')
      .innerJoinAndSelect('schedule.seat_map', 'seat_map')
      .where('schedule.company_id = :companyId', { companyId })
      .andWhere('route.uuid = :routeUuid', { routeUuid })
      .andWhere('schedule.status = true')
      .andWhere('schedule.start_date <= :date', { date })
      .andWhere('schedule.end_date >= :date', { date })
      .andWhere(':weekday = ANY(schedule.weekdays)', { weekday })
      .orderBy('schedule.departure_time', 'ASC')
      .addOrderBy('schedule.start_date', 'ASC')
      .addOrderBy('schedule.created_at', 'ASC')
      .getMany();
  }
}
