import { Injectable } from '@nestjs/common';
import { toAdminPermissionGroup } from '../../mappers/admin/admin-permission.mapper.js';
import { AdminPermissionGroupRepository } from '../../repository/admin/admin-permission-group.repository.js';

@Injectable()
export class AdminFindPermissionGroupUseCase {
  constructor(private readonly groups: AdminPermissionGroupRepository) {}

  async execute(uuid: string) {
    return toAdminPermissionGroup(await this.groups.findByUuid(uuid));
  }
}
