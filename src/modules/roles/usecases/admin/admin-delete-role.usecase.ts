import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../repository/role.repository.js';

/** Hard delete; the role's permission grants are removed by ON DELETE CASCADE. */
@Injectable()
export class AdminDeleteRoleUseCase {
  constructor(private readonly roles: RoleRepository) {}

  async execute(uuid: string) {
    const role = await this.roles.findByUuid(uuid);
    await this.roles.remove(role);
    return {
      id: role.uuid,
      name: role.name,
    };
  }
}
