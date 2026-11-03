import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { AdminCreateRouteDto } from '../../dto/admin/admin-create-route.dto.js';
import {
  normalizeRouteCode,
  routeNameFromEndpoints,
  toPublicRoute,
} from '../../mappers/route.mapper.js';
import { RouteRepository } from '../../repository/route.repository.js';

/** Creates a route for any company; it is appended after the company's existing routes. */
@Injectable()
export class AdminCreateRouteUseCase {
  constructor(
    private readonly routes: RouteRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the route. */
  async execute(dto: AdminCreateRouteDto, actorUsername: string) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const routeCode = normalizeRouteCode(dto.route_code);
    await this.routes.assertUnique(company.id, routeCode);

    const saved = await this.routes.save(
      this.routes.create({
        uuid: crypto.randomUUID(),
        company_id: company.id,
        company,
        route_code: routeCode,
        name: dto.name || routeNameFromEndpoints(dto.origin, dto.destination),
        origin: dto.origin,
        destination: dto.destination,
        distance_km: dto.distance_km ?? null,
        duration_minutes: dto.duration_minutes ?? null,
        note: dto.note ?? '',
        status: dto.status ?? true,
        sort_order: await this.routes.nextSortOrder(company.id),
        created_by: actorUsername || null,
        updated_by: actorUsername || null,
      }),
    );
    saved.company = company;
    return toPublicRoute(saved);
  }
}
