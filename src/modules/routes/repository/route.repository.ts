import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Route } from '../entities/route.entity.js';
import { normalizeRouteCode } from '../mappers/route.mapper.js';

const SEARCH_COLUMNS = [
  'route_code',
  'name',
  'origin',
  'destination',
  'note',
] as const;
const ADMIN_COMPANY_SEARCH_COLUMNS = ['name', 'short_name', 'company_code'] as const;
const COMPANY_RELATION = { company: true } as const;

@Injectable()
export class RouteRepository {
  constructor(
    @InjectRepository(Route)
    private readonly routes: Repository<Route>,
  ) {}

  create(data: Partial<Route>) {
    return this.routes.create(data);
  }

  save(route: Route) {
    return this.routes.save(route);
  }

  merge(route: Route, fields: Partial<Route>) {
    return this.routes.merge(route, fields);
  }

  remove(route: Route) {
    return this.routes.remove(route);
  }

  async findByUuid(uuid: string) {
    const route = await this.routes.findOne({
      where: { uuid },
      relations: COMPANY_RELATION,
    });
    if (!route) {
      throw new NotFoundException('Không tìm thấy tuyến đường.');
    }
    return route;
  }

  async findAll(companyId: string, query?: string) {
    const keyword = query?.trim();
    const qb = this.routes
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.company', 'company')
      .where('route.company_id = :companyId', { companyId });

    if (keyword) {
      const filters = SEARCH_COLUMNS.map(
        (column) => `LOWER(route.${column}) LIKE :q`,
      ).join(' OR ');
      qb.andWhere(`(${filters})`, {
        q: `%${keyword.toLowerCase()}%`,
      });
    }

    return qb
      .orderBy('route.sort_order', 'ASC')
      .addOrderBy('route.created_at', 'DESC')
      .getMany();
  }

  /** Routes of every company (or of one when `companyId` is set); the keyword also matches the company. */
  async findAllForAdmin(options: { companyId?: string; query?: string }) {
    const keyword = options.query?.trim();
    const qb = this.routes
      .createQueryBuilder('route')
      .innerJoinAndSelect('route.company', 'company');

    if (options.companyId) {
      qb.where('route.company_id = :companyId', {
        companyId: options.companyId,
      });
    }

    if (keyword) {
      const filters = [
        ...SEARCH_COLUMNS.map((column) => `LOWER(route.${column}) LIKE :q`),
        ...ADMIN_COMPANY_SEARCH_COLUMNS.map(
          (column) => `LOWER(company.${column}) LIKE :q`,
        ),
      ].join(' OR ');
      qb.andWhere(`(${filters})`, { q: `%${keyword.toLowerCase()}%` });
    }

    return qb
      .orderBy('company.name', 'ASC')
      .addOrderBy('route.sort_order', 'ASC')
      .addOrderBy('route.created_at', 'DESC')
      .getMany();
  }

  async nextSortOrder(companyId: string) {
    const result = await this.routes
      .createQueryBuilder('route')
      .select('MAX(route.sort_order)', 'max')
      .where('route.company_id = :companyId', { companyId })
      .getRawOne<{ max: string | number | null }>();
    return Number(result?.max ?? -1) + 1;
  }

  /**
   * Gives each route its index in `ids` as sort_order. Moving a route is an update of
   * that record, so routes whose position changes get updated_by (and, through
   * @UpdateDateColumn, updated_at); routes that keep their position are left untouched.
   */
  async reorder(companyId: string, ids: string[], actorUsername: string) {
    await this.routes.manager.transaction(async (manager) => {
      const current = await manager.find(Route, {
        select: { uuid: true, sort_order: true },
        where: { company_id: companyId },
      });
      const sortOrderByUuid = new Map(
        current.map((route) => [route.uuid, route.sort_order]),
      );

      for (const [index, uuid] of ids.entries()) {
        if (sortOrderByUuid.get(uuid) === index) {
          continue;
        }
        await manager.update(
          Route,
          { uuid, company_id: companyId },
          { sort_order: index, updated_by: actorUsername || null },
        );
      }
    });
  }

  async assertUnique(companyId: string, routeCode: string, excludeId?: string) {
    const code = normalizeRouteCode(routeCode);
    const existed = await this.routes.findOne({
      where: excludeId
        ? {
            company_id: companyId,
            route_code: ILike(code),
            id: Not(excludeId),
          }
        : { company_id: companyId, route_code: ILike(code) },
    });

    if (existed) {
      throw new ConflictException('Mã tuyến đã tồn tại.');
    }
  }
}
