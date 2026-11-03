import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toOperatorOffice } from '../../mappers/operator/operator-office.mapper.js';
import { OfficeRepository } from '../../repository/office.repository.js';

@Injectable()
export class OperatorFindAllOfficesUseCase {
  constructor(
    private readonly offices: OfficeRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(companyUuid: string, query?: string) {
    const company = await this.companies.findByUuid(companyUuid);
    const offices = await this.offices.findAll(company.id, query);
    return offices.map(toOperatorOffice);
  }
}
