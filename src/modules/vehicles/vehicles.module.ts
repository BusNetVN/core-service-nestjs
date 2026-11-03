import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { OfficesModule } from '../offices/offices.module.js';
import { VehiclesController } from './controllers/vehicles.controller.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { VehicleRepository } from './repository/vehicle.repository.js';
import { CreateVehicleUseCase } from './usecases/create-vehicle.usecase.js';
import { FindAllVehiclesUseCase } from './usecases/find-all-vehicles.usecase.js';
import { FindVehicleUseCase } from './usecases/find-vehicle.usecase.js';
import { RemoveVehicleUseCase } from './usecases/remove-vehicle.usecase.js';
import { UpdateVehicleUseCase } from './usecases/update-vehicle.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    CompaniesModule,
    OfficesModule,
  ],
  controllers: [VehiclesController],
  providers: [
    VehicleRepository,
    FindAllVehiclesUseCase,
    FindVehicleUseCase,
    CreateVehicleUseCase,
    UpdateVehicleUseCase,
    RemoveVehicleUseCase,
  ],
  exports: [VehicleRepository],
})
export class VehiclesModule {}
