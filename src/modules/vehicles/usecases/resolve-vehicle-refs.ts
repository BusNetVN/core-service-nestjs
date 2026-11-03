import { BadRequestException } from '@nestjs/common';
import type { OfficeRepository } from '../../offices/repository/office.repository.js';
import { Vehicle } from '../entities/vehicle.entity.js';

// Returns the office relation only when `office_uuid` is present; null clears it.
export async function resolveVehicleRefs(
  companyId: string,
  refs: { office_uuid?: string | null },
  offices: OfficeRepository,
): Promise<Partial<Vehicle>> {
  if (refs.office_uuid === undefined) {
    return {};
  }
  if (refs.office_uuid === null) {
    return { office: null, office_id: null };
  }

  const office = await offices.findByUuid(refs.office_uuid);
  if (office.company_id !== companyId) {
    throw new BadRequestException('Chi nhánh không thuộc nhà xe.');
  }
  return { office, office_id: office.id };
}
