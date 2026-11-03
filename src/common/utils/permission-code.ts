import { AccountType, StaffRole } from '../constants/account.constant.js';
import {
  COMPANY_ADMIN_PERMISSIONS,
  COMPANY_STAFF_PERMISSIONS,
} from '../constants/api-permissions.js';

/** Permission codes are upper case with "_" separators, e.g. "OFFICE_LIST". */
export function normalizePermissionCode(value: string) {
  return value.trim().toUpperCase();
}

export function parsePermissionCodes(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string' && item.length > 0)
    .map((item) => normalizePermissionCode(item))
    .filter(Boolean);
}

/**
 * Normalized codes an account may use: the codes of its roles (carried in the access token)
 * plus the defaults of a company staff account's staff_role.
 */
export function grantedPermissionCodes(account: {
  account_type: string;
  staff_role: string | null;
  permissions: string[];
}) {
  const granted = new Set(
    account.permissions.map((code) => normalizePermissionCode(code)).filter(Boolean),
  );

  if (account.account_type === AccountType.COMPANY_STAFF) {
    const defaults =
      account.staff_role === StaffRole.ADMIN
        ? COMPANY_ADMIN_PERMISSIONS
        : COMPANY_STAFF_PERMISSIONS;
    for (const code of defaults) {
      granted.add(normalizePermissionCode(code));
    }
  }

  return granted;
}
