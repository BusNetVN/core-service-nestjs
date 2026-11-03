import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { CreateRouteDto } from '../dto/create-route.dto.js';
import {
  normalizeRouteCode,
  routeNameFromEndpoints,
  toPublicRoute,
} from '../mappers/route.mapper.js';
import { RouteRepository } from '../repository/route.repository.js';

@Injectable()
export class CreateRouteUseCase {
  constructor(
    private readonly routes: RouteRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `actorUsername` is the username of the user creating the route. */
  async execute(dto: CreateRouteDto, actorUsername: string) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const routeCode = normalizeRouteCode(dto.route_code);
    await this.routes.assertUnique(company.id, routeCode);
    const origin = dto.origin.trim();
    const destination = dto.destination.trim();
    const route = this.routes.create({
      uuid: crypto.randomUUID(),
      company_id: company.id,
      company,
      route_code: routeCode,
      name: dto.name?.trim() || routeNameFromEndpoints(origin, destination),
      origin,
      destination,
      distance_km: dto.distance_km ?? null,
      duration_minutes: dto.duration_minutes ?? null,
      note: dto.note?.trim() ?? '',
      status: dto.status ?? true,
      sort_order: await this.routes.nextSortOrder(company.id),
      created_by: actorUsername || null,
      updated_by: actorUsername || null,
    });
    const saved = await this.routes.save(route);
    saved.company = company;
    return toPublicRoute(saved);
  }
}
