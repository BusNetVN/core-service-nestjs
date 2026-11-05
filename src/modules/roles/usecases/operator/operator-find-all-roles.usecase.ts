import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toOperatorRole } from '../../mappers/operator/operator-role.mapper.js';
import { OperatorRoleRepository } from '../../repository/operator/operator-role.repository.js';

@Injectable()
export class OperatorFindAllRolesUseCase {
  constructor(
    private readonly roles: OperatorRoleRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(companyUuid: string, query?: string) {
    const company = await this.companies.findByUuid(companyUuid);
    const roles = await this.roles.findAll(company.id, query);
    return roles.map(toOperatorRole);
  }
}
