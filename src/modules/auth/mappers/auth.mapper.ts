import type { IssuedTokens, TokenSubject } from '../../../common/services/token.service.js';
import { grantedPermissionCodes } from '../../../common/utils/permission-code.js';
import { User } from '../../users/entities/user.entity.js';
import { toPublicUser } from '../../users/mappers/user.mapper.js';
import type { OperatorAccess } from '../usecases/operator-access.js';

export function toTokenSubject(user: User, permissions?: string[]): TokenSubject {
  return {
    uuid: user.uuid,
    username: user.username,
    account_type: user.account_type,
    staff_role: user.staff_role,
    company_uuid: user.company?.uuid ?? null,
    permissions,
  };
}

export function toLoginResponse(user: User, tokens: IssuedTokens) {
  return {
    ...tokens,
    account: {
      username: user.username ?? '',
      account_type: user.account_type,
      is_active: user.is_active,
      full_name: user.full_name ?? '',
    },
  };
}

/**
 * `account.permissions` holds every normalized code the account may use (roles plus the
 * staff_role defaults), the same set PermissionsGuard checks.
 */
export function toOperatorLoginResponse(
  user: User,
  tokens: IssuedTokens,
  access: OperatorAccess,
) {
  const permissions = grantedPermissionCodes({
    account_type: user.account_type,
    staff_role: user.staff_role,
    permissions: access.permissions,
  });
  return {
    ...tokens,
    account: {
      ...toPublicUser(user, access.roles),
      permissions: [...permissions].sort(),
    },
  };
}
