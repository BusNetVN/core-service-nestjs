import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../../permissions/repository/permission.repository.js';
import { AdminUpdateRoleDto } from '../../dto/admin/admin-update-role.dto.js';
import { Role } from '../../entities/role.entity.js';
import { toPublicRole } from '../../mappers/role.mapper.js';
import { RoleRepository } from '../../repository/role.repository.js';

/** Partial update; the company of a role cannot be changed. */
@Injectable()
export class AdminUpdateRoleUseCase {
  constructor(
    private readonly roles: RoleRepository,
    private readonly permissions: PermissionRepository,
  ) {}

  /** `actorUsername` is the username of the admin updating the role. */
  async execute(uuid: string, dto: AdminUpdateRoleDto, actorUsername: string) {
    const role = await this.roles.findByUuid(uuid);
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
    return toPublicRole(saved);
  }
}
