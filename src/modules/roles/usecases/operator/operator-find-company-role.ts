import { ForbiddenException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { OperatorRoleRepository } from '../../repository/operator/operator-role.repository.js';

/** The role `uuid` when it belongs to `companyUuid`; 404 when missing, 403 for another company. */
export async function findCompanyRole(
  roles: OperatorRoleRepository,
  companyUuid: string,
  uuid: string,
) {
  const role = await roles.findByUuid(uuid);
  if (role.company.uuid !== companyUuid) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return role;
}
