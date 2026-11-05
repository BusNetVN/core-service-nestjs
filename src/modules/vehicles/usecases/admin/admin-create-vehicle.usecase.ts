import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { AdminOfficeRepository } from '../../../offices/repository/admin/admin-office.repository.js';
import { AdminCreateVehicleDto } from '../../dto/admin/admin-create-vehicle.dto.js';
import { VehicleCondition, VehicleStatus } from '../../enums/vehicle.enum.js';
import {
  normalizeLicensePlate,
  toAdminVehicle,
} from '../../mappers/admin/admin-vehicle.mapper.js';
import { AdminVehicleRepository } from '../../repository/admin/admin-vehicle.repository.js';
import { resolveAdminVehicleOffice } from './admin-resolve-vehicle-office.js';

/** Creates a vehicle for any company named by `company_uuid` (no company-scope restriction). */
@Injectable()
export class AdminCreateVehicleUseCase {
  constructor(
    private readonly vehicles: AdminVehicleRepository,
    private readonly companies: CompanyRepository,
    private readonly offices: AdminOfficeRepository,
  ) {}

  async execute(dto: AdminCreateVehicleDto) {
    const company = await this.companies.findByUuid(dto.company_uuid);
    const licensePlate = normalizeLicensePlate(dto.license_plate);
    await this.vehicles.assertUniquePlate(company.id, licensePlate);
    const office = await resolveAdminVehicleOffice(
      this.offices,
      company.id,
      dto.office_uuid,
    );

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
      ...office,
    });
    await this.vehicles.save(vehicle);
    return toAdminVehicle(await this.vehicles.findByUuid(vehicle.uuid));
  }
}
