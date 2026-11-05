import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { toAdminVehicle } from '../../mappers/admin/admin-vehicle.mapper.js';
import { AdminVehicleRepository } from '../../repository/admin/admin-vehicle.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The company is optional: without it, vehicles of every company are listed. */
@Injectable()
export class AdminFindAllVehiclesUseCase {
  constructor(
    private readonly vehicles: AdminVehicleRepository,
    private readonly companies: CompanyRepository,
  ) {}

  async execute(options: { companyUuid?: string; query?: string }) {
    let companyId: string | undefined;
    if (options.companyUuid) {
      if (!UUID_V4.test(options.companyUuid)) {
        throw new BadRequestException('Nhà xe không hợp lệ.');
      }
      companyId = (await this.companies.findByUuid(options.companyUuid)).id;
    }

    const vehicles = await this.vehicles.findAll({
      companyId,
      query: options.query,
    });
    return vehicles.map(toAdminVehicle);
  }
}
