import { BadRequestException, Injectable } from '@nestjs/common';
import { toPublicUser } from '../../mappers/user.mapper.js';
import { UserRoleRepository } from '../../repository/user-role.repository.js';
import { UserRepository } from '../../repository/user.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AdminFindAllUsersUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly userRoles: UserRoleRepository,
  ) {}

  async execute(options: {
    companyUuid?: string;
    accountType?: string;
    query?: string;
  }) {
    if (options.companyUuid && !UUID_V4.test(options.companyUuid)) {
      throw new BadRequestException('Nhà xe không hợp lệ.');
    }
    const users = await this.users.findAll(options);
    const rolesByUser = await this.userRoles.findRolesByUserIds(
      users.map((user) => user.id),
    );
    return users.map((user) => toPublicUser(user, rolesByUser.get(user.id)));
  }
}
