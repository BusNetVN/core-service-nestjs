import { Injectable } from '@nestjs/common';
import { OperatorOfficeRepository } from '../../../offices/repository/operator/operator-office.repository.js';
import { OperatorUpdateVehicleDto } from '../../dto/operator/operator-update-vehicle.dto.js';
import { Vehicle } from '../../entities/vehicle.entity.js';
import {
  normalizeLicensePlate,
  toOperatorVehicle,
} from '../../mappers/operator/operator-vehicle.mapper.js';
import { OperatorVehicleRepository } from '../../repository/operator/operator-vehicle.repository.js';
import { findCompanyVehicle } from './operator-find-company-vehicle.js';
import { resolveOperatorVehicleOffice } from './operator-resolve-vehicle-office.js';

/** Columns that accept null; null sent for any other column is ignored. */
const NULLABLE = new Set([
  'manufacture_year',
  'service_life_year',
  'registration_date',
]);

/** Partial update of a vehicle of `companyUuid`; the company itself cannot change. */
@Injectable()
export class OperatorUpdateVehicleUseCase {
  constructor(
    private readonly vehicles: OperatorVehicleRepository,
    private readonly offices: OperatorOfficeRepository,
  ) {}

  /** `actorUsername` is the username of the staff member updating the vehicle. */
  async execute(
    companyUuid: string,
    uuid: string,
    dto: OperatorUpdateVehicleDto,
    actorUsername: string,
  ) {
    const vehicle = await findCompanyVehicle(this.vehicles, companyUuid, uuid);
    const { office_uuid, license_plate, ...plain } = dto;

    const fields: Partial<Vehicle> = { updated_by: actorUsername || null };
    for (const [key, value] of Object.entries(plain)) {
      if (value !== undefined && (value !== null || NULLABLE.has(key))) {
        (fields as Record<string, unknown>)[key] = value;
      }
    }

    if (license_plate) {
      const plate = normalizeLicensePlate(license_plate);
      await this.vehicles.assertUniquePlate(vehicle.company_id, plate, vehicle.id);
      fields.license_plate = plate;
    }

    Object.assign(
      fields,
      await resolveOperatorVehicleOffice(this.offices, vehicle.company_id, office_uuid),
    );

    this.vehicles.merge(vehicle, fields);
    await this.vehicles.save(vehicle);
    return toOperatorVehicle(await this.vehicles.findByUuid(uuid));
  }
}
