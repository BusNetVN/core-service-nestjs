import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';
import { OperatorUsersController } from './controllers/operator-users.controller.js';
import { UserRole } from './entities/user-role.entity.js';
import { User } from './entities/user.entity.js';
import { AdminUserRoleRepository } from './repository/admin/admin-user-role.repository.js';
import { AdminUserRepository } from './repository/admin/admin-user.repository.js';
import { OperatorUserRoleRepository } from './repository/operator/operator-user-role.repository.js';
import { OperatorUserRepository } from './repository/operator/operator-user.repository.js';
import { AdminCreateUserUseCase } from './usecases/admin/admin-create-user.usecase.js';
import { AdminDeleteUserUseCase } from './usecases/admin/admin-delete-user.usecase.js';
import { AdminFindAllUsersUseCase } from './usecases/admin/admin-find-all-users.usecase.js';
import { AdminFindUserUseCase } from './usecases/admin/admin-find-user.usecase.js';
import { AdminUpdateUserUseCase } from './usecases/admin/admin-update-user.usecase.js';
import { OperatorCreateUserUseCase } from './usecases/operator/operator-create-user.usecase.js';
import { OperatorDeleteUserUseCase } from './usecases/operator/operator-delete-user.usecase.js';
import { OperatorFindAllUsersUseCase } from './usecases/operator/operator-find-all-users.usecase.js';
import { OperatorUpdateUserUseCase } from './usecases/operator/operator-update-user.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    CompaniesModule,
    RolesModule,
  ],
  controllers: [AdminUsersController, OperatorUsersController],
  providers: [
    AdminUserRepository,
    AdminUserRoleRepository,
    OperatorUserRepository,
    OperatorUserRoleRepository,
    AdminFindAllUsersUseCase,
    AdminFindUserUseCase,
    AdminCreateUserUseCase,
    AdminUpdateUserUseCase,
    AdminDeleteUserUseCase,
    OperatorFindAllUsersUseCase,
    OperatorCreateUserUseCase,
    OperatorUpdateUserUseCase,
    OperatorDeleteUserUseCase,
  ],
  // Auth: admin login uses the admin repository, operator login/refresh/change-password the operator ones.
  exports: [AdminUserRepository, OperatorUserRepository, OperatorUserRoleRepository],
})
export class UsersModule {}
