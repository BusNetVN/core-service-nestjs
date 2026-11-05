import { BadRequestException, Injectable } from '@nestjs/common';
import { OperatorUserRepository } from '../../repository/operator/operator-user.repository.js';
import { findCompanyStaff } from './operator-find-company-staff.js';
import type { OperatorUserActor } from './operator-user-actor.js';

/**
 * Soft delete of a COMPANY_STAFF account: the row is kept (username stays reserved) and the
 * account is locked so it can no longer log in. The actor is recorded as updated_by.
 */
@Injectable()
export class OperatorDeleteUserUseCase {
  constructor(private readonly users: OperatorUserRepository) {}

  async execute(companyUuid: string, uuid: string, actor: OperatorUserActor) {
    const user = await findCompanyStaff(this.users, companyUuid, uuid);
    if (user.uuid === actor.uuid) {
      throw new BadRequestException('Không thể xóa tài khoản đang đăng nhập.');
    }

    const now = new Date();
    user.deleted_at = now;
    user.status = false;
    user.updated_by = actor.username || null;
    user.updated_at = now;
    await this.users.save(user);

    return {
      id: user.uuid,
      username: user.username ?? '',
    };
  }
}
