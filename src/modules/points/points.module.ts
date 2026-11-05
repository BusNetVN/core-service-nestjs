import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { LocationsModule } from '../locations/locations.module.js';
import { Province } from '../locations/entities/province.entity.js';
import { Ward } from '../locations/entities/ward.entity.js';
import { AdminPointController } from './controllers/admin-point.controller.js';
import { OperatorPointController } from './controllers/operator-point.controller.js';
import { Point } from './entities/point.entity.js';
import { AdminPointRepository } from './repository/admin/admin-point.repository.js';
import { OperatorPointRepository } from './repository/operator/operator-point.repository.js';
import { AdminCreatePointUseCase } from './usecases/admin/admin-create-point.usecase.js';
import { AdminDeletePointUseCase } from './usecases/admin/admin-delete-point.usecase.js';
import { AdminFindAllPointsUseCase } from './usecases/admin/admin-find-all-points.usecase.js';
import { AdminFindPointUseCase } from './usecases/admin/admin-find-point.usecase.js';
import { AdminUpdatePointUseCase } from './usecases/admin/admin-update-point.usecase.js';
import { OperatorCreatePointUseCase } from './usecases/operator/operator-create-point.usecase.js';
import { OperatorDeletePointUseCase } from './usecases/operator/operator-delete-point.usecase.js';
import { OperatorFindAllPointsUseCase } from './usecases/operator/operator-find-all-points.usecase.js';
import { OperatorFindPointUseCase } from './usecases/operator/operator-find-point.usecase.js';
import { OperatorUpdatePointUseCase } from './usecases/operator/operator-update-point.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Point, Company, Province, Ward]),
    CompaniesModule,
    LocationsModule,
  ],
  controllers: [AdminPointController, OperatorPointController],
  providers: [
    AdminPointRepository,
    OperatorPointRepository,
    AdminFindAllPointsUseCase,
    AdminFindPointUseCase,
    AdminCreatePointUseCase,
    AdminUpdatePointUseCase,
    AdminDeletePointUseCase,
    OperatorFindAllPointsUseCase,
    OperatorFindPointUseCase,
    OperatorCreatePointUseCase,
    OperatorUpdatePointUseCase,
    OperatorDeletePointUseCase,
  ],
  // Routes (company scoped) check that the chosen points are usable by the route's company.
  exports: [OperatorPointRepository],
})
export class PointsModule {}
