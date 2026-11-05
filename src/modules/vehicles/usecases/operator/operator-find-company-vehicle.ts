import { ForbiddenException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { OperatorVehicleRepository } from '../../repository/operator/operator-vehicle.repository.js';

/** The vehicle `uuid` when it belongs to `companyUuid`; 404 when missing, 403 for another company. */
export async function findCompanyVehicle(
  vehicles: OperatorVehicleRepository,
  companyUuid: string,
  uuid: string,
) {
  const vehicle = await vehicles.findByUuid(uuid);
  if (vehicle.company.uuid !== companyUuid) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return vehicle;
}
