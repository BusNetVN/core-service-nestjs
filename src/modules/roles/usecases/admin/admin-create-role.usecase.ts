import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { PermissionRepository } from '../../../permissions/repository/permission.repository.js';
import { AdminCreateRoleDto } from '../../dto/admin/admin-create-role.dto.js';
import { toPublicRole } from '../../mappers/role.mapper.js';
import { RoleRepository } from '../../repository/role.repository.js';

@Injectable()
export class AdminCreateRoleUseCase {
  constructor(
    private readonly roles: RoleRepository,
    private readonly companies: CompanyRepository,
    private readonly permissions: PermissionRepository,
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
    return toPublicRole(saved);
  }
}
