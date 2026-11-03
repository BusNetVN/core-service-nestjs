import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { toPublicFare } from '../mappers/fare.mapper.js';
import { FareRepository } from '../repository/fare.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class FindAllFaresUseCase {
  constructor(
    private readonly fares: FareRepository,
    private readonly companies: CompanyRepository,
  ) {}

  async execute(companyUuid?: string) {
    if (!companyUuid || !UUID_V4.test(companyUuid)) {
      throw new BadRequestException('Nhà xe không hợp lệ.');
    }
    const company = await this.companies.findByUuid(companyUuid);
    const fares = await this.fares.findAll(company.id);
    return fares.map(toPublicFare);
  }
}
