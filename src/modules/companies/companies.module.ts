import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCompaniesController } from './controllers/admin-companies.controller.js';
import { CompaniesController } from './controllers/companies.controller.js';
import { Company } from './entities/company.entity.js';
import { CompanyRepository } from './repository/company.repository.js';
import { CreateCompanyUseCase } from './usecases/create-company.usecase.js';
import { FindAllCompaniesUseCase } from './usecases/find-all-companies.usecase.js';
import { FindCompanyUseCase } from './usecases/find-company.usecase.js';
import { RemoveCompanyUseCase } from './usecases/remove-company.usecase.js';
import { UpdateCompanyUseCase } from './usecases/update-company.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController, AdminCompaniesController],
  providers: [
    CompanyRepository,
    FindAllCompaniesUseCase,
    FindCompanyUseCase,
    CreateCompanyUseCase,
    UpdateCompanyUseCase,
    RemoveCompanyUseCase,
  ],
  exports: [CompanyRepository],
})
export class CompaniesModule {}
