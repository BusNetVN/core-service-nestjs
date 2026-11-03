import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { PermissionsModule } from '../permissions/permissions.module.js';
import { AdminRolesController } from './controllers/admin-roles.controller.js';
import { OperatorRolesController } from './controllers/operator-roles.controller.js';
import { Role } from './entities/role.entity.js';
import { RoleRepository } from './repository/role.repository.js';
import { AdminCreateRoleUseCase } from './usecases/admin/admin-create-role.usecase.js';
import { AdminDeleteRoleUseCase } from './usecases/admin/admin-delete-role.usecase.js';
import { AdminFindAllRolesUseCase } from './usecases/admin/admin-find-all-roles.usecase.js';
import { AdminFindRoleUseCase } from './usecases/admin/admin-find-role.usecase.js';
import { AdminUpdateRoleUseCase } from './usecases/admin/admin-update-role.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    CompaniesModule,
    PermissionsModule,
  ],
  controllers: [AdminRolesController, OperatorRolesController],
  providers: [
    RoleRepository,
    AdminFindAllRolesUseCase,
    AdminFindRoleUseCase,
    AdminCreateRoleUseCase,
    AdminUpdateRoleUseCase,
    AdminDeleteRoleUseCase,
  ],
  exports: [RoleRepository],
})
export class RolesModule {}
