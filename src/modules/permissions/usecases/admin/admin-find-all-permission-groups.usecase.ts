import { Injectable } from '@nestjs/common';
import { toAdminPermissionGroup } from '../../mappers/admin/admin-permission.mapper.js';
import { AdminPermissionGroupRepository } from '../../repository/admin/admin-permission-group.repository.js';

@Injectable()
export class AdminFindAllPermissionGroupsUseCase {
  constructor(private readonly groups: AdminPermissionGroupRepository) {}

  async execute(query?: string) {
    const groups = await this.groups.findAll(query);
    return groups.map(toAdminPermissionGroup);
  }
}
