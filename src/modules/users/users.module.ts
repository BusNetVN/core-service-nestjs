import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from '../companies/companies.module.js';
import { RolesModule } from '../roles/roles.module.js';
import { AdminUsersController } from './controllers/admin-users.controller.js';
import { OperatorStaffController } from './controllers/operator-staff.controller.js';
import { UserRole } from './entities/user-role.entity.js';
import { User } from './entities/user.entity.js';
import { UserRoleRepository } from './repository/user-role.repository.js';
import { UserRepository } from './repository/user.repository.js';
import { AdminCreateUserUseCase } from './usecases/admin/admin-create-user.usecase.js';
import { AdminDeleteUserUseCase } from './usecases/admin/admin-delete-user.usecase.js';
import { AdminFindAllUsersUseCase } from './usecases/admin/admin-find-all-users.usecase.js';
import { AdminFindUserUseCase } from './usecases/admin/admin-find-user.usecase.js';
import { AdminUpdateUserUseCase } from './usecases/admin/admin-update-user.usecase.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole]),
    CompaniesModule,
    RolesModule,
  ],
  controllers: [AdminUsersController, OperatorStaffController],
  providers: [
    UserRepository,
    UserRoleRepository,
    AdminFindAllUsersUseCase,
    AdminFindUserUseCase,
    AdminCreateUserUseCase,
    AdminUpdateUserUseCase,
    AdminDeleteUserUseCase,
  ],
  exports: [UserRepository, UserRoleRepository],
})
export class UsersModule {}
