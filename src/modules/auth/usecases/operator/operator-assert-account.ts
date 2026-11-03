import { ForbiddenException } from '@nestjs/common';
import { AccountType } from '../../../../common/constants/account.constant.js';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { User } from '../../../users/entities/user.entity.js';

/** bnv-operator is only for staff of an active company; `user.company` must be loaded. */
export function assertOperatorAccount(user: User) {
  if (!user.status) {
    throw new ForbiddenException(ErrorMessage.ACCOUNT_LOCKED);
  }
  if (user.account_type !== AccountType.COMPANY_STAFF) {
    throw new ForbiddenException(
      'Tài khoản không có quyền truy cập hệ thống vận hành.',
    );
  }
  if (!user.company) {
    throw new ForbiddenException('Tài khoản chưa được gắn với nhà xe.');
  }
  if (!user.company.is_active) {
    throw new ForbiddenException('Nhà xe đang ngừng hoạt động.');
  }
}
