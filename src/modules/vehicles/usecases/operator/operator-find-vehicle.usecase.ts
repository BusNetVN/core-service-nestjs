import { Injectable } from '@nestjs/common';
import { toOperatorVehicle } from '../../mappers/operator/operator-vehicle.mapper.js';
import { OperatorVehicleRepository } from '../../repository/operator/operator-vehicle.repository.js';
import { findCompanyVehicle } from './operator-find-company-vehicle.js';

@Injectable()
export class OperatorFindVehicleUseCase {
  constructor(private readonly vehicles: OperatorVehicleRepository) {}

  async execute(companyUuid: string, uuid: string) {
    return toOperatorVehicle(
      await findCompanyVehicle(this.vehicles, companyUuid, uuid),
    );
  }
}
