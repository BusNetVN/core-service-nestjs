import { Injectable } from '@nestjs/common';
import { AdminPermissionGroupRepository } from '../../repository/admin/admin-permission-group.repository.js';

/** Hard delete; the group's permissions are removed by ON DELETE CASCADE. */
@Injectable()
export class AdminDeletePermissionGroupUseCase {
  constructor(private readonly groups: AdminPermissionGroupRepository) {}

  async execute(uuid: string) {
    const group = await this.groups.findByUuid(uuid);
    await this.groups.remove(group);
    return {
      id: group.uuid,
      code: group.code,
      name: group.name,
    };
  }
}
