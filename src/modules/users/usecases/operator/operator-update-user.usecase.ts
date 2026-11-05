import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { STAFF_ROLE_VALUES } from '../../../../common/constants/account.constant.js';
import { OperatorRoleRepository } from '../../../roles/repository/operator/operator-role.repository.js';
import { OperatorUpdateUserDto } from '../../dto/operator/operator-update-user.dto.js';
import {
  normalizeEmail,
  normalizeUsername,
  toOperatorUser,
} from '../../mappers/operator/operator-user.mapper.js';
import { OperatorUserRoleRepository } from '../../repository/operator/operator-user-role.repository.js';
import { OperatorUserRepository } from '../../repository/operator/operator-user.repository.js';
import { PASSWORD_HASH_ROUNDS } from './operator-create-user.usecase.js';
import { findCompanyStaff } from './operator-find-company-staff.js';
import type { OperatorUserActor } from './operator-user-actor.js';

/** Partial update of a COMPANY_STAFF account; its type and company cannot change. */
@Injectable()
export class OperatorUpdateUserUseCase {
  constructor(
    private readonly users: OperatorUserRepository,
    private readonly roles: OperatorRoleRepository,
    private readonly userRoles: OperatorUserRoleRepository,
  ) {}

  /** `actor` is the signed-in staff member: its uuid blocks self-locking, its username is recorded as updater. */
  async execute(
    companyUuid: string,
    uuid: string,
    dto: OperatorUpdateUserDto,
    actor: OperatorUserActor,
  ) {
    const user = await findCompanyStaff(this.users, companyUuid, uuid);
    if (user.uuid === actor.uuid && dto.status === false) {
      throw new BadRequestException(
        'Không thể tự khóa tài khoản đang đăng nhập.',
      );
    }

    const username =
      dto.username == null ? null : normalizeUsername(dto.username);
    if (username && username !== user.username) {
      await this.users.assertUsernameAvailable(username, user.id);
    }

    const email = dto.email == null ? null : normalizeEmail(dto.email);
    if (email && email !== user.email) {
      await this.users.assertEmailAvailable(email, user.id);
    }

    const roles =
      dto.role_ids === undefined
        ? await this.userRoles.findRoles(user.id)
        : await this.roles.findByUuidsInCompany(user.company.id, dto.role_ids);

    const staffRole = STAFF_ROLE_VALUES.find((role) => role === dto.staff_role);
    if (staffRole) user.staff_role = staffRole;
    if (username) user.username = username;
    if (dto.password) {
      user.password_hash = await hash(dto.password, PASSWORD_HASH_ROUNDS);
    }
    if (dto.full_name != null) user.full_name = dto.full_name;
    if (email != null) user.email = email;
    if (dto.phone != null) user.phone_number = dto.phone;
    if (dto.status != null) user.status = dto.status;
    user.updated_by = actor.username || null;
    user.updated_at = new Date();

    const saved = await this.users.save(user);
    if (dto.role_ids !== undefined) {
      await this.userRoles.replace(saved.id, roles);
    }
    return toOperatorUser(saved, roles);
  }
}
