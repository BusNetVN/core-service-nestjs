import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { OperatorPermissionRepository } from '../../../permissions/repository/operator/operator-permission.repository.js';
import { OperatorCreateRoleDto } from '../../dto/operator/operator-create-role.dto.js';
import { toOperatorRole } from '../../mappers/operator/operator-role.mapper.js';
import { OperatorRoleRepository } from '../../repository/operator/operator-role.repository.js';

@Injectable()
export class OperatorCreateRoleUseCase {
  constructor(
    private readonly roles: OperatorRoleRepository,
    private readonly companies: CompanyRepository,
    private readonly permissions: OperatorPermissionRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(
    companyUuid: string,
    dto: OperatorCreateRoleDto,
    actorUsername: string,
  ) {
    const company = await this.companies.findByUuid(companyUuid);
    await this.roles.assertNameAvailable(company.id, dto.name);
    const permissions = await this.permissions.findByUuids(
      dto.permission_ids ?? [],
    );

    const saved = await this.roles.save(
      this.roles.create({
        uuid: crypto.randomUUID(),
        company_id: company.id,
        company,
        name: dto.name,
        description: dto.description ?? '',
        is_active: dto.is_active ?? true,
        permissions,
        created_by: actorUsername || null,
        updated_by: actorUsername || null,
      }),
    );
    saved.company = company;
    return toOperatorRole(saved);
  }
}
