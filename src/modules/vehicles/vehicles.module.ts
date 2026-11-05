import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { OfficesModule } from '../offices/offices.module.js';
import { AdminVehicleController } from './controllers/admin-vehicle.controller.js';
import { OperatorVehicleController } from './controllers/operator-vehicle.controller.js';
import { Vehicle } from './entities/vehicle.entity.js';
import { AdminVehicleRepository } from './repository/admin/admin-vehicle.repository.js';
import { OperatorVehicleRepository } from './repository/operator/operator-vehicle.repository.js';
import { AdminCreateVehicleUseCase } from './usecases/admin/admin-create-vehicle.usecase.js';
import { AdminDeleteVehicleUseCase } from './usecases/admin/admin-delete-vehicle.usecase.js';
import { AdminFindAllVehiclesUseCase } from './usecases/admin/admin-find-all-vehicles.usecase.js';
import { AdminFindVehicleUseCase } from './usecases/admin/admin-find-vehicle.usecase.js';
import { AdminUpdateVehicleUseCase } from './usecases/admin/admin-update-vehicle.usecase.js';
import { OperatorCreateVehicleUseCase } from './usecases/operator/operator-create-vehicle.usecase.js';
import { OperatorDeleteVehicleUseCase } from './usecases/operator/operator-delete-vehicle.usecase.js';
import { OperatorFindAllVehiclesUseCase } from './usecases/operator/operator-find-all-vehicles.usecase.js';
import { OperatorFindVehicleUseCase } from './usecases/operator/operator-find-vehicle.usecase.js';
import { OperatorUpdateVehicleUseCase } from './usecases/operator/operator-update-vehicle.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    CompaniesModule,
    OfficesModule,
  ],
  controllers: [AdminVehicleController, OperatorVehicleController],
  providers: [
    AdminVehicleRepository,
    OperatorVehicleRepository,
    AdminFindAllVehiclesUseCase,
    AdminFindVehicleUseCase,
    AdminCreateVehicleUseCase,
    AdminUpdateVehicleUseCase,
    AdminDeleteVehicleUseCase,
    OperatorFindAllVehiclesUseCase,
    OperatorFindVehicleUseCase,
    OperatorCreateVehicleUseCase,
    OperatorUpdateVehicleUseCase,
    OperatorDeleteVehicleUseCase,
  ],
})
export class VehiclesModule {}
