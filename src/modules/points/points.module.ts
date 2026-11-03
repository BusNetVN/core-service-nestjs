import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { LocationsModule } from '../locations/locations.module.js';
import { Province } from '../locations/entities/province.entity.js';
import { Ward } from '../locations/entities/ward.entity.js';
import { AdminPointsController } from './controllers/admin-points.controller.js';
import { PointsController } from './controllers/points.controller.js';
import { Point } from './entities/point.entity.js';
import { PointRepository } from './repository/point.repository.js';
import { AdminCreatePointUseCase } from './usecases/admin/admin-create-point.usecase.js';
import { AdminDeletePointUseCase } from './usecases/admin/admin-delete-point.usecase.js';
import { AdminFindAllPointsUseCase } from './usecases/admin/admin-find-all-points.usecase.js';
import { AdminUpdatePointUseCase } from './usecases/admin/admin-update-point.usecase.js';
import { CreatePointUseCase } from './usecases/create-point.usecase.js';
import { FindAllPointsUseCase } from './usecases/find-all-points.usecase.js';
import { FindPointUseCase } from './usecases/find-point.usecase.js';
import { RemovePointUseCase } from './usecases/remove-point.usecase.js';
import { UpdatePointUseCase } from './usecases/update-point.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Point, Company, Province, Ward]),
    CompaniesModule,
    LocationsModule,
  ],
  controllers: [PointsController, AdminPointsController],
  providers: [
    PointRepository,
    AdminFindAllPointsUseCase,
    AdminCreatePointUseCase,
    AdminUpdatePointUseCase,
    AdminDeletePointUseCase,
    FindAllPointsUseCase,
    FindPointUseCase,
    CreatePointUseCase,
    UpdatePointUseCase,
    RemovePointUseCase,
  ],
  exports: [PointRepository],
})
export class PointsModule {}
