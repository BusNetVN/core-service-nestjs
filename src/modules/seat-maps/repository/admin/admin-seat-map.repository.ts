import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { SeatMap } from '../../entities/seat-map.entity.js';

const SEARCH_COLUMNS = ['seat_map_code', 'name', 'layout_type', 'note'] as const;
const COMPANY_RELATION = { company: true } as const;

/** Seat map data access for /api/admin/seat-maps. */
@Injectable()
export class AdminSeatMapRepository {
  constructor(
    @InjectRepository(SeatMap)
    private readonly seatMaps: Repository<SeatMap>,
  ) {}

  create(data: Partial<SeatMap>) {
    return this.seatMaps.create(data);
  }

  save(seatMap: SeatMap) {
    return this.seatMaps.save(seatMap);
  }

  merge(seatMap: SeatMap, fields: Partial<SeatMap>) {
    return this.seatMaps.merge(seatMap, fields);
  }

  remove(seatMap: SeatMap) {
    return this.seatMaps.remove(seatMap);
  }

  async findByUuid(uuid: string) {
    const seatMap = await this.seatMaps.findOne({
      where: { uuid },
      relations: COMPANY_RELATION,
    });
    if (!seatMap) {
      throw new NotFoundException('Không tìm thấy sơ đồ ghế.');
    }
    return seatMap;
  }

  /** Seat maps of every company (or of one when `companyId` is set), by company then newest. */
  async findAll(options: { companyId?: string; query?: string }) {
    const keyword = options.query?.trim();
    const qb = this.seatMaps
      .createQueryBuilder('seat_map')
      .innerJoinAndSelect('seat_map.company', 'company');

    if (options.companyId) {
      qb.where('seat_map.company_id = :companyId', {
        companyId: options.companyId,
      });
    }

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(seat_map.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb
      .orderBy('company.name', 'ASC')
      .addOrderBy('seat_map.created_at', 'DESC')
      .getMany();
  }

  /** Seat map codes are unique per company, compared case-insensitively. */
  async assertUnique(companyId: string, code: string, excludeId?: string) {
    const seatMapCode = code.trim().toUpperCase();
    const existed = await this.seatMaps.findOne({
      where: excludeId
        ? {
            company_id: companyId,
            seat_map_code: ILike(seatMapCode),
            id: Not(excludeId),
          }
        : { company_id: companyId, seat_map_code: ILike(seatMapCode) },
    });

    if (existed) {
      throw new ConflictException('Mã sơ đồ ghế đã tồn tại.');
    }
  }
}
