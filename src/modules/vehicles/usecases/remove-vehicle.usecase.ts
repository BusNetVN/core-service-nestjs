import { Injectable } from '@nestjs/common';
import { VehicleRepository } from '../repository/vehicle.repository.js';

@Injectable()
export class RemoveVehicleUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(uuid: string) {
    const vehicle = await this.vehicles.findByUuid(uuid);
    await this.vehicles.remove(vehicle);
    return { id: vehicle.uuid, license_plate: vehicle.license_plate };
  }
}
