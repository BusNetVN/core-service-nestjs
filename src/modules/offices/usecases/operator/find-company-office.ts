import { ForbiddenException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { OfficeRepository } from '../../repository/office.repository.js';

/** The office `uuid` when it belongs to `companyUuid`; 404 when missing, 403 for another company. */
export async function findCompanyOffice(
  offices: OfficeRepository,
  companyUuid: string,
  uuid: string,
) {
  const office = await offices.findByUuid(uuid);
  if (office.company.uuid !== companyUuid) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return office;
}
