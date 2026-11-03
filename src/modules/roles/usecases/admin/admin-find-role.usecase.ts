import { Injectable } from '@nestjs/common';
import { toPublicRole } from '../../mappers/role.mapper.js';
import { RoleRepository } from '../../repository/role.repository.js';

@Injectable()
export class AdminFindRoleUseCase {
  constructor(private readonly roles: RoleRepository) {}

  async execute(uuid: string) {
    return toPublicRole(await this.roles.findByUuid(uuid));
  }
}
