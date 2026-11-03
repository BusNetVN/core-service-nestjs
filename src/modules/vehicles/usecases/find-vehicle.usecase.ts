import { Injectable } from '@nestjs/common';
import { toPublicVehicle } from '../mappers/vehicle.mapper.js';
import { VehicleRepository } from '../repository/vehicle.repository.js';

@Injectable()
export class FindVehicleUseCase {
  constructor(private readonly vehicles: VehicleRepository) {}

  async execute(uuid: string) {
    return toPublicVehicle(await this.vehicles.findByUuid(uuid));
  }
}
