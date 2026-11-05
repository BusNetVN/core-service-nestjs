import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toOperatorPoint } from '../../mappers/operator/operator-point.mapper.js';
import { OperatorPointRepository } from '../../repository/operator/operator-point.repository.js';

/** Points of the company plus the shared points it may use. */
@Injectable()
export class OperatorFindAllPointsUseCase {
  constructor(
    private readonly points: OperatorPointRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(companyUuid: string, query?: string) {
    const company = await this.companies.findByUuid(companyUuid);
    const points = await this.points.findVisible(company.id, query);
    return points.map(toOperatorPoint);
  }
}
