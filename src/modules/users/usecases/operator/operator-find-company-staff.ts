import { ForbiddenException } from '@nestjs/common';
import { AccountType } from '../../../../common/constants/account.constant.js';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { OperatorUserRepository } from '../../repository/operator/operator-user.repository.js';

/**
 * The account `uuid` when it is a COMPANY_STAFF of `companyUuid`; 404 when missing or
 * deleted, 403 for any other account (another company, agency, system admin).
 */
export async function findCompanyStaff(
  users: OperatorUserRepository,
  companyUuid: string,
  uuid: string,
) {
  const user = await users.findActiveByUuid(uuid);
  const { company } = user;
  if (
    !company ||
    company.uuid !== companyUuid ||
    user.account_type !== AccountType.COMPANY_STAFF
  ) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return Object.assign(user, { company });
}
