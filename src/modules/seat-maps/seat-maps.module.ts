import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { AdminSeatMapController } from './controllers/admin-seat-map.controller.js';
import { OperatorSeatMapController } from './controllers/operator-seat-map.controller.js';
import { SeatMap } from './entities/seat-map.entity.js';
import { AdminSeatMapRepository } from './repository/admin/admin-seat-map.repository.js';
import { OperatorSeatMapRepository } from './repository/operator/operator-seat-map.repository.js';
import { AdminCreateSeatMapUseCase } from './usecases/admin/admin-create-seat-map.usecase.js';
import { AdminDeleteSeatMapUseCase } from './usecases/admin/admin-delete-seat-map.usecase.js';
import { AdminFindAllSeatMapsUseCase } from './usecases/admin/admin-find-all-seat-maps.usecase.js';
import { AdminFindSeatMapUseCase } from './usecases/admin/admin-find-seat-map.usecase.js';
import { AdminUpdateSeatMapUseCase } from './usecases/admin/admin-update-seat-map.usecase.js';
import { OperatorCreateSeatMapUseCase } from './usecases/operator/operator-create-seat-map.usecase.js';
import { OperatorDeleteSeatMapUseCase } from './usecases/operator/operator-delete-seat-map.usecase.js';
import { OperatorFindAllSeatMapsUseCase } from './usecases/operator/operator-find-all-seat-maps.usecase.js';
import { OperatorFindSeatMapUseCase } from './usecases/operator/operator-find-seat-map.usecase.js';
import { OperatorUpdateSeatMapUseCase } from './usecases/operator/operator-update-seat-map.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([SeatMap, Company]), CompaniesModule],
  controllers: [AdminSeatMapController, OperatorSeatMapController],
  providers: [
    AdminSeatMapRepository,
    OperatorSeatMapRepository,
    AdminFindAllSeatMapsUseCase,
    AdminFindSeatMapUseCase,
    AdminCreateSeatMapUseCase,
    AdminUpdateSeatMapUseCase,
    AdminDeleteSeatMapUseCase,
    OperatorFindAllSeatMapsUseCase,
    OperatorFindSeatMapUseCase,
    OperatorCreateSeatMapUseCase,
    OperatorUpdateSeatMapUseCase,
    OperatorDeleteSeatMapUseCase,
  ],
  // Schedules and fares (company scoped) look up the seat map they are attached to.
  exports: [OperatorSeatMapRepository],
})
export class SeatMapsModule {}
