import { Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toOperatorVehicle } from '../../mappers/operator/operator-vehicle.mapper.js';
import { OperatorVehicleRepository } from '../../repository/operator/operator-vehicle.repository.js';

@Injectable()
export class OperatorFindAllVehiclesUseCase {
  constructor(
    private readonly vehicles: OperatorVehicleRepository,
    private readonly companies: CompanyRepository,
  ) {}

  /** `companyUuid` is the company of the access token. */
  async execute(companyUuid: string, query?: string) {
    const company = await this.companies.findByUuid(companyUuid);
    const vehicles = await this.vehicles.findAll(company.id, query);
    return vehicles.map(toOperatorVehicle);
  }
}
