import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { Company } from '../companies/entities/company.entity.js';
import { AdminOfficeController } from './controllers/admin-office.controller.js';
import { OperatorOfficeController } from './controllers/operator-office.controller.js';
import { Office } from './entities/office.entity.js';
import { AdminOfficeRepository } from './repository/admin/admin-office.repository.js';
import { OperatorOfficeRepository } from './repository/operator/operator-office.repository.js';
import { AdminCreateOfficeUseCase } from './usecases/admin/admin-create-office.usecase.js';
import { AdminDeleteOfficeUseCase } from './usecases/admin/admin-delete-office.usecase.js';
import { AdminFindAllOfficesUseCase } from './usecases/admin/admin-find-all-office.usecase.js';
import { AdminFindOfficeUseCase } from './usecases/admin/admin-find-office.usecase.js';
import { AdminUpdateOfficeUseCase } from './usecases/admin/admin-update-office.usecase.js';
import { OperatorCreateOfficeUseCase } from './usecases/operator/operator-create-office.usecase.js';
import { OperatorDeleteOfficeUseCase } from './usecases/operator/operator-delete-office.usecase.js';
import { OperatorFindAllOfficesUseCase } from './usecases/operator/operator-find-all-offices.usecase.js';
import { OperatorFindOfficeUseCase } from './usecases/operator/operator-find-office.usecase.js';
import { OperatorUpdateOfficeUseCase } from './usecases/operator/operator-update-office.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([Office, Company]), CompaniesModule],
  controllers: [AdminOfficeController, OperatorOfficeController],
  providers: [
    AdminOfficeRepository,
    OperatorOfficeRepository,
    AdminFindAllOfficesUseCase,
    AdminFindOfficeUseCase,
    AdminCreateOfficeUseCase,
    AdminUpdateOfficeUseCase,
    AdminDeleteOfficeUseCase,
    OperatorFindAllOfficesUseCase,
    OperatorFindOfficeUseCase,
    OperatorCreateOfficeUseCase,
    OperatorUpdateOfficeUseCase,
    OperatorDeleteOfficeUseCase,
  ],
  // Vehicles (company staff) check that the chosen office belongs to their company.
  exports: [OperatorOfficeRepository],
})
export class OfficesModule {}
