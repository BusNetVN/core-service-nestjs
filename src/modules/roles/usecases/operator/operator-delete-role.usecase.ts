import { Injectable } from '@nestjs/common';
import { OperatorRoleRepository } from '../../repository/operator/operator-role.repository.js';
import { findCompanyRole } from './operator-find-company-role.js';

/** Hard delete; permission grants and account assignments go with it (ON DELETE CASCADE). */
@Injectable()
export class OperatorDeleteRoleUseCase {
  constructor(private readonly roles: OperatorRoleRepository) {}

  async execute(companyUuid: string, uuid: string) {
    const role = await findCompanyRole(this.roles, companyUuid, uuid);
    await this.roles.remove(role);
    return {
      id: role.uuid,
      name: role.name,
    };
  }
}
