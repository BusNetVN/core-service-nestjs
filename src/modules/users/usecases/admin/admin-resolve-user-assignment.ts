import { BadRequestException } from '@nestjs/common';
import {
  AccountType,
  STAFF_ROLE_VALUES,
  type AccountTypeValue,
  type StaffRoleValue,
} from '../../../../common/constants/account.constant.js';
import type { Company } from '../../../companies/entities/company.entity.js';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import type { Role } from '../../../roles/entities/role.entity.js';
import { AdminRoleRepository } from '../../../roles/repository/admin/admin-role.repository.js';

function requiresCompany(accountType: AccountTypeValue) {
  return (
    accountType === AccountType.COMPANY_STAFF ||
    accountType === AccountType.AGENCY
  );
}

function requiresStaffRole(accountType: AccountTypeValue) {
  return accountType === AccountType.COMPANY_STAFF;
}

/**
 * `requested` is the company uuid from the request; missing or empty keeps `current`.
 * Account types without a company reject one instead of silently dropping it.
 */
export async function resolveUserCompany(
  companies: CompanyRepository,
  accountType: AccountTypeValue,
  requested: string | null | undefined,
  current: Company | null,
): Promise<Company | null> {
  if (!requiresCompany(accountType)) {
    if (requested) {
      throw new BadRequestException(
        'Chỉ tài khoản nhân viên nhà xe hoặc đại lý mới được gắn nhà xe.',
      );
    }
    return null;
  }

  if (!requested || requested === current?.uuid) {
    if (!current) {
      throw new BadRequestException('Vui lòng chọn nhà xe cho loại tài khoản này.');
    }
    return current;
  }

  const company = await companies.findOptionalByUuid(requested);
  if (!company) {
    throw new BadRequestException('Nhà xe không tồn tại.');
  }
  return company;
}

export function resolveUserStaffRole(
  accountType: AccountTypeValue,
  requested: string | null | undefined,
  current: StaffRoleValue | null,
) {
  if (!requiresStaffRole(accountType)) {
    return null;
  }

  const parsed = STAFF_ROLE_VALUES.find((role) => role === requested);
  const staffRole = parsed ?? current;
  if (!staffRole) {
    throw new BadRequestException('Vui lòng chọn vai trò.');
  }
  return staffRole;
}

/**
 * Roles always belong to the account's `company` (already resolved). `requested` is the
 * list of role uuids from the request; missing keeps those of `current` that still belong
 * to the company, so changing the company drops the old company's roles.
 */
export async function resolveUserRoles(
  roles: AdminRoleRepository,
  company: Company | null,
  requested: string[] | undefined,
  current: Role[],
): Promise<Role[]> {
  if (!company) {
    if (requested?.length) {
      throw new BadRequestException(
        'Chỉ tài khoản thuộc nhà xe mới được gán nhóm quyền.',
      );
    }
    return [];
  }

  if (requested === undefined) {
    return current.filter((role) => role.company_id === company.id);
  }
  return roles.findByUuidsInCompany(company.id, requested);
}
