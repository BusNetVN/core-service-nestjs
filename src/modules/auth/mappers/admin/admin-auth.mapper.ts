import type {
  IssuedTokens,
  TokenSubject,
} from '../../../../common/services/token.service.js';
import { User } from '../../../users/entities/user.entity.js';

export function toAdminTokenSubject(user: User): TokenSubject {
  return {
    uuid: user.uuid,
    username: user.username,
    account_type: user.account_type,
    staff_role: user.staff_role,
    company_uuid: user.company?.uuid ?? null,
  };
}

/** Response of /api/admin/auth/login and /refresh. */
export function toAdminLoginResponse(user: User, tokens: IssuedTokens) {
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
