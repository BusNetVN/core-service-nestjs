import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { ReorderRoutesDto } from '../dto/reorder-routes.dto.js';
import { toPublicRoute } from '../mappers/route.mapper.js';
import { RouteRepository } from '../repository/route.repository.js';

@Injectable()
export class ReorderRoutesUseCase {
  constructor(
    private readonly routes: RouteRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `actorUsername` is recorded as updated_by on every route whose position changes. */
  async execute(dto: ReorderRoutesDto, actorUsername: string) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const routes = await this.routes.findAll(company.id);
    const known = new Set(routes.map((route) => route.uuid));

    if (
      dto.ids.length !== routes.length ||
      dto.ids.some((id) => !known.has(id))
    ) {
      throw new BadRequestException('Danh sách tuyến không hợp lệ.');
    }

    await this.routes.reorder(company.id, dto.ids, actorUsername);
    const ordered = await this.routes.findAll(company.id);
    return ordered.map(toPublicRoute);
  }
}
