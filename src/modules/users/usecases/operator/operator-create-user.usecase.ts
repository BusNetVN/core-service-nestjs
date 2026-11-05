import { BadRequestException, Injectable } from '@nestjs/common';
import { hash } from 'bcryptjs';
import {
  AccountType,
  STAFF_ROLE_VALUES,
} from '../../../../common/constants/account.constant.js';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { OperatorRoleRepository } from '../../../roles/repository/operator/operator-role.repository.js';
import { OperatorCreateUserDto } from '../../dto/operator/operator-create-user.dto.js';
import {
  normalizeEmail,
  normalizeUsername,
  toOperatorUser,
} from '../../mappers/operator/operator-user.mapper.js';
import { OperatorUserRoleRepository } from '../../repository/operator/operator-user-role.repository.js';
import { OperatorUserRepository } from '../../repository/operator/operator-user.repository.js';

export const PASSWORD_HASH_ROUNDS = 10;

/** Creates a COMPANY_STAFF account of the company in the access token. */
@Injectable()
export class OperatorCreateUserUseCase {
  constructor(
    private readonly users: OperatorUserRepository,
    private readonly companies: CompanyRepository,
    private readonly roles: OperatorRoleRepository,
    private readonly userRoles: OperatorUserRoleRepository,
  ) {}

  /** `actorUsername` is the username of the staff member creating the account. */
  async execute(
    companyUuid: string,
    dto: OperatorCreateUserDto,
    actorUsername: string,
  ) {
    const staffRole = STAFF_ROLE_VALUES.find((role) => role === dto.staff_role);
    if (!staffRole) {
      throw new BadRequestException('Vui lòng chọn vai trò.');
    }

    const username = normalizeUsername(dto.username);
    const email = normalizeEmail(dto.email ?? '');
    await this.users.assertUsernameAvailable(username);
    if (email) {
      await this.users.assertEmailAvailable(email);
    }

    const company = await this.companies.findByUuid(companyUuid);
    const roles = await this.roles.findByUuidsInCompany(
      company.id,
      dto.role_ids ?? [],
    );

    const now = new Date();
    const user = this.users.create({
      uuid: crypto.randomUUID(),
      username,
      password_hash: await hash(dto.password, PASSWORD_HASH_ROUNDS),
      account_type: AccountType.COMPANY_STAFF,
      staff_role: staffRole,
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
    return toOperatorUser(saved, roles);
  }
}
