import { Injectable } from '@nestjs/common';
import { CreatePermissionDto } from '../dto/create-permission.dto.js';
import {
  normalizeCatalogCode,
  toPublicPermission,
} from '../mappers/permission.mapper.js';
import { PermissionGroupRepository } from '../repository/permission-group.repository.js';
import { PermissionRepository } from '../repository/permission.repository.js';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    private readonly groups: PermissionGroupRepository,
    private readonly permissions: PermissionRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the permission. */
  async execute(groupUuid: string, dto: CreatePermissionDto, actorUsername: string) {
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
    return toPublicPermission(await this.permissions.save(permission));
  }
}
