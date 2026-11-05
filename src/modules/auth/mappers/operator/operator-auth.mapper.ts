import type {
  IssuedTokens,
  TokenSubject,
} from '../../../../common/services/token.service.js';
import { grantedPermissionCodes } from '../../../../common/utils/permission-code.js';
import { User } from '../../../users/entities/user.entity.js';
import { toOperatorUser } from '../../../users/mappers/operator/operator-user.mapper.js';
import type { OperatorAccess } from '../../usecases/operator/operator-access.js';

/** `permissions` are the codes of the account's roles, carried in the access token. */
export function toOperatorTokenSubject(
  user: User,
  permissions: string[],
): TokenSubject {
  return {
    uuid: user.uuid,
    username: user.username,
    account_type: user.account_type,
    staff_role: user.staff_role,
    company_uuid: user.company?.uuid ?? null,
    permissions,
  };
}

/**
 * Response of /api/operator/auth/login and /refresh. `account.permissions` holds every
 * code the account may use (roles plus the staff_role defaults), the set PermissionsGuard checks.
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
      ...toOperatorUser(user, access.roles),
      permissions: [...permissions].sort(),
    },
  };
}
