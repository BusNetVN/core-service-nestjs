import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { RoleRepository } from '../../../roles/repository/role.repository.js';
import { AdminUpdateUserDto } from '../../dto/admin/admin-update-user.dto.js';
import {
  normalizeEmail,
  normalizeUsername,
  toPublicUser,
} from '../../mappers/user.mapper.js';
import { UserRoleRepository } from '../../repository/user-role.repository.js';
import { UserRepository } from '../../repository/user.repository.js';
import type { UserActor } from '../user-actor.js';
import {
  resolveUserCompany,
  resolveUserRoles,
  resolveUserStaffRole,
} from '../resolve-user-assignment.js';
import { PASSWORD_HASH_ROUNDS } from './admin-create-user.usecase.js';

@Injectable()
export class AdminUpdateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly companies: CompanyRepository,
    private readonly roles: RoleRepository,
    private readonly userRoles: UserRoleRepository,
  ) {}

  /** `actor` is the signed-in admin: its uuid blocks self-locking, its username is recorded as updater. */
  async execute(uuid: string, dto: AdminUpdateUserDto, actor: UserActor) {
    const user = await this.users.findActiveByUuid(uuid);
    const accountType = dto.account_type ?? user.account_type;

    if (
      user.uuid === actor.uuid &&
      (dto.status === false || accountType !== user.account_type)
    ) {
      throw new BadRequestException(
        'Không thể tự khóa hoặc đổi loại tài khoản đang đăng nhập.',
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

    user.company = await resolveUserCompany(
      this.companies,
      accountType,
      dto.company_uuid,
      user.company,
    );
    const roles = await resolveUserRoles(
      this.roles,
      user.company,
      dto.role_ids,
      await this.userRoles.findRoles(user.id),
    );
    user.staff_role = resolveUserStaffRole(
      accountType,
      dto.staff_role,
      user.staff_role,
    );
    user.account_type = accountType;
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
    await this.userRoles.replace(saved.id, roles);
    return toPublicUser(saved, roles);
  }
}
