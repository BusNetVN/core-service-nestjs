import { Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { AdminRoleRepository } from '../../../roles/repository/admin/admin-role.repository.js';
import { AdminCreateUserDto } from '../../dto/admin/admin-create-user.dto.js';
import {
  normalizeEmail,
  normalizeUsername,
  toAdminUser,
} from '../../mappers/admin/admin-user.mapper.js';
import { AdminUserRoleRepository } from '../../repository/admin/admin-user-role.repository.js';
import { AdminUserRepository } from '../../repository/admin/admin-user.repository.js';
import {
  resolveUserCompany,
  resolveUserRoles,
  resolveUserStaffRole,
} from './admin-resolve-user-assignment.js';

export const PASSWORD_HASH_ROUNDS = 10;

@Injectable()
export class AdminCreateUserUseCase {
  constructor(
    private readonly users: AdminUserRepository,
    private readonly companies: CompanyRepository,
    private readonly roles: AdminRoleRepository,
    private readonly userRoles: AdminUserRoleRepository,
  ) {}

  /** `actorUsername` is the username of the admin creating the user. */
  async execute(dto: AdminCreateUserDto, actorUsername: string) {
    const username = normalizeUsername(dto.username);
    const email = normalizeEmail(dto.email ?? '');
    await this.users.assertUsernameAvailable(username);
    if (email) {
      await this.users.assertEmailAvailable(email);
    }

    const company = await resolveUserCompany(
      this.companies,
      dto.account_type,
      dto.company_uuid,
      null,
    );
    const roles = await resolveUserRoles(this.roles, company, dto.role_ids, []);

    const now = new Date();
    const user = this.users.create({
      uuid: crypto.randomUUID(),
      username,
      password_hash: await hash(dto.password, PASSWORD_HASH_ROUNDS),
      account_type: dto.account_type,
      staff_role: resolveUserStaffRole(dto.account_type, dto.staff_role, null),
      status: dto.status ?? true,
      is_active: true,
      full_name: dto.full_name ?? '',
      email,
      phone_number: dto.phone ?? '',
      company,
      created_by: actorUsername || null,
      updated_by: actorUsername || null,
      created_at: now,
      updated_at: now,
    });
    const saved = await this.users.save(user);
    await this.userRoles.replace(saved.id, roles);
    return toAdminUser(saved, roles);
  }
}
