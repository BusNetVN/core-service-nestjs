import { Injectable } from '@nestjs/common';
import { OperatorPermissionRepository } from '../../../permissions/repository/operator/operator-permission.repository.js';
import { OperatorUpdateRoleDto } from '../../dto/operator/operator-update-role.dto.js';
import { Role } from '../../entities/role.entity.js';
import { toOperatorRole } from '../../mappers/operator/operator-role.mapper.js';
import { OperatorRoleRepository } from '../../repository/operator/operator-role.repository.js';
import { findCompanyRole } from './operator-find-company-role.js';

/** Partial update of a role of `companyUuid`; the company itself cannot change. */
@Injectable()
export class OperatorUpdateRoleUseCase {
  constructor(
    private readonly roles: OperatorRoleRepository,
    private readonly permissions: OperatorPermissionRepository,
  ) {}

  async execute(
    companyUuid: string,
    uuid: string,
    dto: OperatorUpdateRoleDto,
    actorUsername: string,
  ) {
    const role = await findCompanyRole(this.roles, companyUuid, uuid);
    const fields: Partial<Role> = { updated_by: actorUsername || null };

    if (dto.name !== undefined) {
      await this.roles.assertNameAvailable(role.company_id, dto.name, role.id);
      fields.name = dto.name;
    }
    if (dto.description !== undefined) fields.description = dto.description;
    if (dto.is_active !== undefined) fields.is_active = dto.is_active;

    this.roles.merge(role, fields);
    if (dto.permission_ids !== undefined) {
      role.permissions = await this.permissions.findByUuids(dto.permission_ids);
    }
    const saved = await this.roles.save(role);
    saved.company = role.company;
    return toOperatorRole(saved);
  }
}
