import { ForbiddenException } from '@nestjs/common';
import { AccountType } from '../../../../common/constants/account.constant.js';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { User } from '../../../users/entities/user.entity.js';

/** bnv-admin is only for active SYSTEM_ADMIN accounts. */
export function assertAdminAccount(user: User) {
  if (!user.status) {
    throw new ForbiddenException(ErrorMessage.ACCOUNT_LOCKED);
  }
  if (user.account_type !== AccountType.SYSTEM_ADMIN) {
    throw new ForbiddenException(
      'Tài khoản không có quyền truy cập hệ thống quản trị.',
    );
  }
}
