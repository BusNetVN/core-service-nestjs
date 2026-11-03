import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { OfficeRepository } from '../../offices/repository/office.repository.js';
import { CreateVehicleDto } from '../dto/create-vehicle.dto.js';
import { VehicleCondition, VehicleStatus } from '../enums/vehicle.enum.js';
import {
  normalizeLicensePlate,
  toPublicVehicle,
} from '../mappers/vehicle.mapper.js';
import { VehicleRepository } from '../repository/vehicle.repository.js';
import { resolveVehicleRefs } from './resolve-vehicle-refs.js';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    private readonly vehicles: VehicleRepository,
    private readonly companies: CompanyRepository,
    private readonly offices: OfficeRepository,
  ) {}

  async execute(dto: CreateVehicleDto) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const licensePlate = normalizeLicensePlate(dto.license_plate);
    await this.vehicles.assertUniquePlate(company.id, licensePlate);
    const refs = await resolveVehicleRefs(company.id, dto, this.offices);

    const vehicle = this.vehicles.create({
      uuid: crypto.randomUUID(),
      company_id: company.id,
      company,
      license_plate: licensePlate,
      engine_number: dto.engine_number ?? '',
      chassis_number: dto.chassis_number ?? '',
      seat_count: dto.seat_count ?? 0,
      model_code: dto.model_code ?? '',
      vehicle_kind: dto.vehicle_kind ?? '',
      color: dto.color ?? '',
      payload: dto.payload ?? 0,
      initial_odometer: dto.initial_odometer ?? 0,
      brand: dto.brand ?? '',
      manufacture_year: dto.manufacture_year ?? null,
      manufacture_country: dto.manufacture_country ?? '',
      service_life_year: dto.service_life_year ?? null,
      owner_name: dto.owner_name ?? '',
      registration_date: dto.registration_date ?? null,
      condition: dto.condition ?? VehicleCondition.New,
      status: dto.status ?? VehicleStatus.InUse,
      office: null,
      ...refs,
    });
    await this.vehicles.save(vehicle);
    return toPublicVehicle(await this.vehicles.findByUuid(vehicle.uuid));
  }
}
