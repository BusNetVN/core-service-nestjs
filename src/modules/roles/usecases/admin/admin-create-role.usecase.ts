import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { AdminPermissionRepository } from '../../../permissions/repository/admin/admin-permission.repository.js';
import { AdminCreateRoleDto } from '../../dto/admin/admin-create-role.dto.js';
import { toAdminRole } from '../../mappers/admin/admin-role.mapper.js';
import { AdminRoleRepository } from '../../repository/admin/admin-role.repository.js';

@Injectable()
export class AdminCreateRoleUseCase {
  constructor(
    private readonly roles: AdminRoleRepository,
    private readonly companies: CompanyRepository,
    private readonly permissions: AdminPermissionRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the role. */
  async execute(dto: AdminCreateRoleDto, actorUsername: string) {
    const company = await this.companies.findByUuid(dto.company_uuid);
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
    return toAdminRole(saved);
  }
}
