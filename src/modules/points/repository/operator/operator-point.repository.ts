import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Point } from '../../entities/point.entity.js';

const SEARCH_COLUMNS = ['point_code', 'name', 'point_type', 'address', 'note'] as const;
const POINT_RELATIONS = {
  company: true,
  province: true,
  ward: true,
} as const;

/** A shared point is usable by a company unless its allowed list exists and omits the company. */
const COMPANY_CAN_USE_SYSTEM_POINT = `(
  NOT EXISTS (
    SELECT 1
    FROM tbl_point_allowed_companies access
    WHERE access.point_id = point.id
  )
  OR EXISTS (
    SELECT 1
    FROM tbl_point_allowed_companies access
    WHERE access.point_id = point.id
      AND access.company_id = :companyId
  )
)`;

/** Point data access for /api/operator/points (and company-scoped modules such as routes). */
@Injectable()
export class OperatorPointRepository {
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

  /** Callers must still check that the company may see or change the point. */
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

  /** Points of the company plus the shared points it may use; shared first, then by name. */
  async findVisible(companyId: string, query?: string) {
    const keyword = query?.trim();
    const qb = this.points
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.company', 'company')
      .leftJoinAndSelect('point.province', 'province')
      .leftJoinAndSelect('point.ward', 'ward')
      .where(
        `(point.company_id = :companyId OR (point.scope = 'SYSTEM' AND ${COMPANY_CAN_USE_SYSTEM_POINT}))`,
        { companyId },
      );

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(point.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb
      .orderBy('point.company_id', 'ASC', 'NULLS FIRST')
      .addOrderBy('point.name', 'ASC')
      .getMany();
  }

  /** Points among `uuids` that the company may use (its own or allowed shared points). */
  async findUsableByUuids(companyId: string, uuids: string[]) {
    const unique = [...new Set(uuids)];
    if (unique.length === 0) {
      return [];
    }

    return this.points
      .createQueryBuilder('point')
      .leftJoinAndSelect('point.province', 'province')
      .leftJoinAndSelect('point.ward', 'ward')
      .where('point.uuid IN (:...uuids)', { uuids: unique })
      .andWhere(
        `(point.company_id = :companyId OR (point.scope = 'SYSTEM' AND ${COMPANY_CAN_USE_SYSTEM_POINT}))`,
        { companyId },
      )
      .getMany();
  }

  /** Point codes are unique per company, compared case-insensitively. */
  async assertUnique(companyId: string, pointCode: string, excludeId?: string) {
    const existed = await this.points.findOne({
      where: {
        company_id: companyId,
        point_code: ILike(pointCode.trim().toUpperCase()),
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });

    if (existed) {
      throw new ConflictException('Mã điểm dừng đã tồn tại trong nhà xe.');
    }
  }
}
