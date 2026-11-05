import { Injectable } from '@nestjs/common';
import { AdminUpdatePermissionDto } from '../../dto/admin/admin-update-permission.dto.js';
import {
  normalizeCatalogCode,
  toAdminPermission,
} from '../../mappers/admin/admin-permission.mapper.js';
import { AdminPermissionRepository } from '../../repository/admin/admin-permission.repository.js';

@Injectable()
export class AdminUpdatePermissionUseCase {
  constructor(private readonly permissions: AdminPermissionRepository) {}

  /** `actorUsername` is the username of the admin updating the permission. */
  async execute(
    uuid: string,
    dto: AdminUpdatePermissionDto,
    actorUsername: string,
  ) {
    const permission = await this.permissions.findByUuid(uuid);

    const code = dto.code === undefined ? undefined : normalizeCatalogCode(dto.code);
    if (code !== undefined && code !== permission.code) {
      await this.permissions.assertCodeAvailable(code, permission.id);
    }
    if (dto.name !== undefined) {
      await this.permissions.assertNameAvailable(
        permission.group_id,
        dto.name,
        permission.id,
      );
    }

    if (code !== undefined) permission.code = code;
    if (dto.name !== undefined) permission.name = dto.name;
    if (dto.description !== undefined) permission.description = dto.description;
    if (dto.sort_order !== undefined) permission.sort_order = dto.sort_order;
    if (dto.is_active !== undefined) permission.is_active = dto.is_active;
    permission.updated_by = actorUsername || null;
    permission.updated_at = new Date();

    return toAdminPermission(await this.permissions.save(permission));
  }
}
