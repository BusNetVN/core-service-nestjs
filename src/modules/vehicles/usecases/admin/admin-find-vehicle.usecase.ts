import { Injectable } from '@nestjs/common';
import { toAdminVehicle } from '../../mappers/admin/admin-vehicle.mapper.js';
import { AdminVehicleRepository } from '../../repository/admin/admin-vehicle.repository.js';

@Injectable()
export class AdminFindVehicleUseCase {
  constructor(private readonly vehicles: AdminVehicleRepository) {}

  async execute(uuid: string) {
    return toAdminVehicle(await this.vehicles.findByUuid(uuid));
  }
}
