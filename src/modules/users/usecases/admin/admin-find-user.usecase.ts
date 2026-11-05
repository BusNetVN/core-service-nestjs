import { Injectable } from '@nestjs/common';
import { toAdminUser } from '../../mappers/admin/admin-user.mapper.js';
import { AdminUserRoleRepository } from '../../repository/admin/admin-user-role.repository.js';
import { AdminUserRepository } from '../../repository/admin/admin-user.repository.js';

@Injectable()
export class AdminFindUserUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly userRoles: AdminUserRoleRepository,
  ) {}

  async execute(uuid: string) {
    const user = await this.users.findActiveByUuid(uuid);
    return toAdminUser(user, await this.userRoles.findRoles(user.id));
  }
}
