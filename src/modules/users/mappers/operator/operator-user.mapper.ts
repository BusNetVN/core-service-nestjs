import type { Role } from '../../../roles/entities/role.entity.js';
import { User } from '../../entities/user.entity.js';

const NAME_COLLATOR = new Intl.Collator('vi');

export type OperatorUserRole = {
  id: string;
  name: string;
};

/**
 * Account as returned by /api/operator/users and as `account` of /api/operator/auth.
 * Never carries the password.
 */
export type OperatorUser = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  company_uuid: string | null;
  account_type: User['account_type'];
  staff_role: User['staff_role'];
  /** Roles (nhóm quyền) of the account's company, sorted by name. */
  roles: OperatorUserRole[];
  status: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function toOperatorUser(user: User, roles: Role[] = []): OperatorUser {
  return {
    id: user.uuid,
    username: user.username ?? '',
    full_name: user.full_name ?? '',
    email: user.email ?? '',
    phone: user.phone_number ?? '',
    company_uuid: user.company?.uuid ?? null,
    account_type: user.account_type,
    staff_role: user.staff_role,
    roles: [...roles]
      .sort((left, right) => NAME_COLLATOR.compare(left.name, right.name))
      .map((role) => ({ id: role.uuid, name: role.name })),
    status: user.status,
    created_by: user.created_by,
    updated_by: user.updated_by,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
