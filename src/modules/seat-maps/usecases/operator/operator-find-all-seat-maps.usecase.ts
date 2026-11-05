import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toOperatorSeatMap } from '../../mappers/operator/operator-seat-map.mapper.js';
import { OperatorSeatMapRepository } from '../../repository/operator/operator-seat-map.repository.js';

@Injectable()
export class OperatorFindAllSeatMapsUseCase {
  constructor(
    private readonly seatMaps: OperatorSeatMapRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(companyUuid: string, query?: string) {
    const company = await this.companies.findByUuid(companyUuid);
    const seatMaps = await this.seatMaps.findAll(company.id, query);
    return seatMaps.map(toOperatorSeatMap);
  }
}
