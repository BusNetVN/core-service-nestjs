import { Injectable } from '@nestjs/common';
import { AdminCreatePermissionDto } from '../../dto/admin/admin-create-permission.dto.js';
import {
  normalizeCatalogCode,
  toAdminPermission,
} from '../../mappers/admin/admin-permission.mapper.js';
import { AdminPermissionGroupRepository } from '../../repository/admin/admin-permission-group.repository.js';
import { AdminPermissionRepository } from '../../repository/admin/admin-permission.repository.js';

@Injectable()
export class AdminCreatePermissionUseCase {
  constructor(
    private readonly groups: AdminPermissionGroupRepository,
    private readonly permissions: AdminPermissionRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the permission. */
  async execute(
    groupUuid: string,
    dto: AdminCreatePermissionDto,
    actorUsername: string,
  ) {
    const group = await this.groups.findByUuid(groupUuid);
    const code = normalizeCatalogCode(dto.code);
    await this.permissions.assertCodeAvailable(code);
    await this.permissions.assertNameAvailable(group.id, dto.name);

    const now = new Date();
    const permission = this.permissions.create({
      uuid: crypto.randomUUID(),
      group_id: group.id,
      code,
      name: dto.name,
      description: dto.description ?? '',
      sort_order:
        dto.sort_order ?? (await this.permissions.nextSortOrder(group.id)),
      is_active: dto.is_active ?? true,
      created_by: actorUsername || null,
      updated_by: actorUsername || null,
      created_at: now,
      updated_at: now,
    });
    return toAdminPermission(await this.permissions.save(permission));
  }
}
