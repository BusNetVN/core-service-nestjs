import { BadRequestException } from '@nestjs/common';
import type { AdminOfficeRepository } from '../../../offices/repository/admin/admin-office.repository.js';
import { Vehicle } from '../../entities/vehicle.entity.js';

/**
 * The office relation for `officeUuid`: undefined leaves it unchanged ({}), null clears it.
 * The office must belong to the vehicle's company (`companyId`).
 */
export async function resolveAdminVehicleOffice(
  offices: AdminOfficeRepository,
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
