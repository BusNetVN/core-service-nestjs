import { ForbiddenException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { OperatorSeatMapRepository } from '../../repository/operator/operator-seat-map.repository.js';

/** The seat map `uuid` when it belongs to `companyUuid`; 404 when missing, 403 for another company. */
export async function findCompanySeatMap(
  seatMaps: OperatorSeatMapRepository,
  companyUuid: string,
  uuid: string,
) {
  const seatMap = await seatMaps.findByUuid(uuid);
  if (seatMap.company.uuid !== companyUuid) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return seatMap;
}
