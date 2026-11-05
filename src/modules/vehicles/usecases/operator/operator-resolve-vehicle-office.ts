import { BadRequestException } from '@nestjs/common';
import type { OperatorOfficeRepository } from '../../../offices/repository/operator/operator-office.repository.js';
import { Vehicle } from '../../entities/vehicle.entity.js';

/**
 * The office relation for `officeUuid`: undefined leaves it unchanged ({}), null clears it.
 * The office must belong to the company of the access token (`companyId`).
 */
export async function resolveOperatorVehicleOffice(
  offices: OperatorOfficeRepository,
  companyId: string,
  officeUuid: string | null | undefined,
): Promise<Partial<Vehicle>> {
  if (officeUuid === undefined) {
    return {};
  }
  if (officeUuid === null) {
    return { office: null, office_id: null };
  }

  const office = await offices.findByUuid(officeUuid);
  if (office.company_id !== companyId) {
    throw new BadRequestException('Chi nhánh không thuộc nhà xe.');
  }
  return { office, office_id: office.id };
}
