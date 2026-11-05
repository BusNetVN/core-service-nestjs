import { Injectable } from '@nestjs/common';
import { AdminOfficeRepository } from '../../../offices/repository/admin/admin-office.repository.js';
import { AdminUpdateVehicleDto } from '../../dto/admin/admin-update-vehicle.dto.js';
import { Vehicle } from '../../entities/vehicle.entity.js';
import {
  normalizeLicensePlate,
  toAdminVehicle,
} from '../../mappers/admin/admin-vehicle.mapper.js';
import { AdminVehicleRepository } from '../../repository/admin/admin-vehicle.repository.js';
import { resolveAdminVehicleOffice } from './admin-resolve-vehicle-office.js';

/** Columns that accept null; null sent for any other column is ignored. */
const NULLABLE = new Set([
  'manufacture_year',
  'service_life_year',
  'registration_date',
]);

/** Partial update; the company of a vehicle cannot be changed. */
@Injectable()
export class AdminUpdateVehicleUseCase {
  constructor(
    private readonly vehicles: AdminVehicleRepository,
    private readonly offices: AdminOfficeRepository,
  ) {}

  /** `actorUsername` is the username of the admin updating the vehicle. */
  async execute(uuid: string, dto: AdminUpdateVehicleDto, actorUsername: string) {
    const vehicle = await this.vehicles.findByUuid(uuid);
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
      await resolveAdminVehicleOffice(this.offices, vehicle.company_id, office_uuid),
    );

    this.vehicles.merge(vehicle, fields);
    await this.vehicles.save(vehicle);
    return toAdminVehicle(await this.vehicles.findByUuid(uuid));
  }
}
