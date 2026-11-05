import { Injectable } from '@nestjs/common';
import { AdminVehicleRepository } from '../../repository/admin/admin-vehicle.repository.js';

@Injectable()
export class AdminDeleteVehicleUseCase {
  constructor(private readonly vehicles: AdminVehicleRepository) {}

  async execute(uuid: string) {
    const vehicle = await this.vehicles.findByUuid(uuid);
    await this.vehicles.remove(vehicle);
    return { id: vehicle.uuid, license_plate: vehicle.license_plate };
  }
}
