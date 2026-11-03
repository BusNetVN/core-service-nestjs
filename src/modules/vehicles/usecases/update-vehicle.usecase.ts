import { Injectable } from '@nestjs/common';
import { OperatorOfficeRepository } from '../../offices/repository/operator/operator-office.repository.js';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto.js';
import { Vehicle } from '../entities/vehicle.entity.js';
import {
  normalizeLicensePlate,
  toPublicVehicle,
} from '../mappers/vehicle.mapper.js';
import { VehicleRepository } from '../repository/vehicle.repository.js';
import { resolveVehicleRefs } from './resolve-vehicle-refs.js';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    private readonly vehicles: VehicleRepository,
    private readonly offices: OperatorOfficeRepository,
  ) {}

  async execute(uuid: string, dto: UpdateVehicleDto) {
    const vehicle = await this.vehicles.findByUuid(uuid);
    const { office_uuid, license_plate, ...plain } = dto;

    const fields: Partial<Vehicle> = {};
    for (const [key, value] of Object.entries(plain)) {
      // Null is only meaningful for nullable columns, so keep non-null columns intact.
      if (value !== undefined && (value !== null || NULLABLE.has(key))) {
        (fields as Record<string, unknown>)[key] = value;
      }
    }

    if (license_plate) {
      const plate = normalizeLicensePlate(license_plate);
      await this.vehicles.assertUniquePlate(
        vehicle.company_id,
        plate,
        vehicle.id,
      );
      fields.license_plate = plate;
    }

    Object.assign(
      fields,
      await resolveVehicleRefs(
        vehicle.company_id,
        { office_uuid },
        this.offices,
      ),
    );

    this.vehicles.merge(vehicle, fields);
    await this.vehicles.save(vehicle);
    return toPublicVehicle(await this.vehicles.findByUuid(uuid));
  }
}

const NULLABLE = new Set([
  'manufacture_year',
  'service_life_year',
  'registration_date',
]);
