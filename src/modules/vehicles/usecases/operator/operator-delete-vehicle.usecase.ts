import { Injectable } from '@nestjs/common';
import { OperatorVehicleRepository } from '../../repository/operator/operator-vehicle.repository.js';
import { findCompanyVehicle } from './operator-find-company-vehicle.js';

@Injectable()
export class OperatorDeleteVehicleUseCase {
  constructor(private readonly vehicles: OperatorVehicleRepository) {}

  async execute(companyUuid: string, uuid: string) {
    const vehicle = await findCompanyVehicle(this.vehicles, companyUuid, uuid);
    await this.vehicles.remove(vehicle);
    return { id: vehicle.uuid, license_plate: vehicle.license_plate };
  }
}
