import { Injectable } from '@nestjs/common';
import { toAdminRole } from '../../mappers/admin/admin-role.mapper.js';
import { AdminRoleRepository } from '../../repository/admin/admin-role.repository.js';

@Injectable()
export class AdminFindRoleUseCase {
  constructor(private readonly roles: AdminRoleRepository) {}

  async execute(uuid: string) {
    return toAdminRole(await this.roles.findByUuid(uuid));
  }
}
