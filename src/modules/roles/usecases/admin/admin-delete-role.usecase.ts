import { Injectable } from '@nestjs/common';
import { AdminRoleRepository } from '../../repository/admin/admin-role.repository.js';

/** Hard delete; the role's permission grants are removed by ON DELETE CASCADE. */
@Injectable()
export class AdminDeleteRoleUseCase {
  constructor(private readonly roles: AdminRoleRepository) {}

  async execute(uuid: string) {
    const role = await this.roles.findByUuid(uuid);
    await this.roles.remove(role);
    return {
      id: role.uuid,
      name: role.name,
    };
  }
}
