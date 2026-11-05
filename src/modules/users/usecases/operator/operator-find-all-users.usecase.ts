import { Injectable } from '@nestjs/common';
import { toOperatorUser } from '../../mappers/operator/operator-user.mapper.js';
import { OperatorUserRoleRepository } from '../../repository/operator/operator-user-role.repository.js';
import { OperatorUserRepository } from '../../repository/operator/operator-user.repository.js';

@Injectable()
export class OperatorFindAllUsersUseCase {
  constructor(
    private readonly users: OperatorUserRepository,
    private readonly userRoles: OperatorUserRoleRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(companyUuid: string, query?: string) {
    const users = await this.users.findAllCompanyStaff(companyUuid, query);
    const rolesByUser = await this.userRoles.findRolesByUserIds(
      users.map((user) => user.id),
    );
    return users.map((user) => toOperatorUser(user, rolesByUser.get(user.id)));
  }
}
