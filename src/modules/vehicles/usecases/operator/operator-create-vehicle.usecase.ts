import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { OperatorOfficeRepository } from '../../../offices/repository/operator/operator-office.repository.js';
import { OperatorCreateVehicleDto } from '../../dto/operator/operator-create-vehicle.dto.js';
import { VehicleCondition, VehicleStatus } from '../../enums/vehicle.enum.js';
import {
  normalizeLicensePlate,
  toOperatorVehicle,
} from '../../mappers/operator/operator-vehicle.mapper.js';
import { OperatorVehicleRepository } from '../../repository/operator/operator-vehicle.repository.js';
import { resolveOperatorVehicleOffice } from './operator-resolve-vehicle-office.js';

/** Creates a vehicle of the company in the access token. */
@Injectable()
export class OperatorCreateVehicleUseCase {
  constructor(
    private readonly vehicles: OperatorVehicleRepository,
    private readonly companies: CompanyRepository,
    private readonly offices: OperatorOfficeRepository,
  ) {}

  /** `actorUsername` is the username of the staff member creating the vehicle. */
  async execute(
    companyUuid: string,
    dto: OperatorCreateVehicleDto,
    actorUsername: string,
  ) {
    const company = await this.companies.findByUuid(companyUuid);
    const licensePlate = normalizeLicensePlate(dto.license_plate);
    await this.vehicles.assertUniquePlate(company.id, licensePlate);
    const office = await resolveOperatorVehicleOffice(
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
      created_by: actorUsername || null,
      updated_by: actorUsername || null,
      office: null,
      ...office,
    });
    await this.vehicles.save(vehicle);
    return toOperatorVehicle(await this.vehicles.findByUuid(vehicle.uuid));
  }
}
