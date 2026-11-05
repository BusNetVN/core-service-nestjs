import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../../companies/entities/company.entity.js';
import { Point } from '../../entities/point.entity.js';
import { PointScope, type PointScopeValue } from '../../enums/point-scope.enum.js';

const SEARCH_COLUMNS = ['point_code', 'name', 'point_type', 'address', 'note'] as const;
const COMPANY_SEARCH_COLUMNS = ['name', 'short_name', 'company_code'] as const;
const POINT_RELATIONS = {
  company: true,
  province: true,
  ward: true,
  allowed_companies: true,
} as const;

/** Point data access for /api/admin/points. */
@Injectable()
export class AdminPointRepository {
  constructor(
    @InjectRepository(Point)
    private readonly points: Repository<Point>,
  ) {}

  create(data: Partial<Point>) {
    return this.points.create(data);
  }

  save(point: Point) {
    return this.points.save(point);
  }

  merge(point: Point, fields: Partial<Point>) {
    return this.points.merge(point, fields);
  }

  remove(point: Point) {
    return this.points.remove(point);
  }

  async findByUuid(uuid: string) {
    const point = await this.points.findOne({
      where: { uuid },
      relations: POINT_RELATIONS,
    });
    if (!point) {
      throw new NotFoundException('Không tìm thấy điểm dừng.');
    }
    return point;
  }

  /**
   * Every point, optionally narrowed to shared points (scope SYSTEM) or to company points
   * (of one company when `companyId` is set); the keyword also matches the owner company.
   * Shared points first, then by company name, then by point name.
   */
  async findAll(options: {
    scope?: PointScopeValue;
    companyId?: string;
    query?: string;
  }) {
    const keyword = options.query?.trim();
    const qb = this.points
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.company', 'company')
      .leftJoinAndSelect('point.province', 'province')
      .leftJoinAndSelect('point.ward', 'ward')
      .leftJoinAndSelect('point.allowed_companies', 'allowed_company')
      .where('1 = 1');

    if (options.scope) {
      qb.andWhere('point.scope = :scope', { scope: options.scope });
    }
    if (options.companyId) {
      qb.andWhere('point.company_id = :companyId', {
        companyId: options.companyId,
      });
    }

    if (keyword) {
      const filters = [
        ...SEARCH_COLUMNS.map((column) => `LOWER(point.${column}) LIKE :q`),
        ...COMPANY_SEARCH_COLUMNS.map((column) => `LOWER(company.${column}) LIKE :q`),
      ].join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb
      .orderBy('point.company_id', 'ASC', 'NULLS FIRST')
      .addOrderBy('company.name', 'ASC')
      .addOrderBy('point.name', 'ASC')
      .getMany();
  }

  /**
   * Shared points (scope SYSTEM) must have unique codes and unique names, compared
   * case-insensitively on the trimmed value. Exact comparison, not LIKE, so "_" and
   * "%" in a code are not wildcards.
   */
  async assertSystemPointUnique(options: {
    pointCode?: string;
    name?: string;
    excludeId?: string;
  }) {
    const checks = [
      {
        column: 'point_code',
        value: options.pointCode,
        message: 'Mã điểm dừng dùng chung đã tồn tại.',
      },
      {
        column: 'name',
        value: options.name,
        message: 'Tên điểm dừng dùng chung đã tồn tại.',
      },
    ] as const;

    for (const check of checks) {
      const value = check.value?.trim();
      if (!value) {
        continue;
      }
      const qb = this.points
        .createQueryBuilder('point')
        .where('point.scope = :scope', { scope: PointScope.SYSTEM })
        .andWhere(`LOWER(TRIM(point.${check.column})) = LOWER(:value)`, { value });
      if (options.excludeId) {
        qb.andWhere('point.id <> :excludeId', { excludeId: options.excludeId });
      }
      if (await qb.getExists()) {
        throw new ConflictException(check.message);
      }
    }
  }

  /** Replaces the companies allowed to use a shared point. */
  async syncAllowedCompanies(pointId: string, companies: Company[]) {
    const current = (await this.points
      .createQueryBuilder()
      .relation(Point, 'allowed_companies')
      .of(pointId)
      .loadMany()) as Company[];
    const nextIds = new Set(companies.map((company) => company.id));
    const currentIds = new Set(current.map((company) => company.id));
    const toAdd = companies.filter((company) => !currentIds.has(company.id));
    const toRemove = current.filter((company) => !nextIds.has(company.id));
    if (toAdd.length === 0 && toRemove.length === 0) {
      return;
    }
    await this.points
      .createQueryBuilder()
      .relation(Point, 'allowed_companies')
      .of(pointId)
      .addAndRemove(toAdd, toRemove);
  }
}
