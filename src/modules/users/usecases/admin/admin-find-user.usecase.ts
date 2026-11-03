import { Injectable } from '@nestjs/common';
import { toPublicUser } from '../../mappers/user.mapper.js';
import { UserRoleRepository } from '../../repository/user-role.repository.js';
import { UserRepository } from '../../repository/user.repository.js';

@Injectable()
export class AdminFindUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly userRoles: UserRoleRepository,
  ) {}

  async execute(uuid: string) {
    const user = await this.users.findActiveByUuid(uuid);
    return toPublicUser(user, await this.userRoles.findRoles(user.id));
  }
}
