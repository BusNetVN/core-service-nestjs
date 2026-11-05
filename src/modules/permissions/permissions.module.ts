import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPermissionGroupsController } from './controllers/admin-permission-groups.controller.js';
import { AdminPermissionController } from './controllers/admin-permission.controller.js';
import { OperatorPermissionGroupsController } from './controllers/operator-permission-groups.controller.js';
import { PermissionGroup } from './entities/permission-group.entity.js';
import { Permission } from './entities/permission.entity.js';
import { AdminPermissionGroupRepository } from './repository/admin/admin-permission-group.repository.js';
import { AdminPermissionRepository } from './repository/admin/admin-permission.repository.js';
import { OperatorPermissionGroupRepository } from './repository/operator/operator-permission-group.repository.js';
import { OperatorPermissionRepository } from './repository/operator/operator-permission.repository.js';
import { AdminCreatePermissionGroupUseCase } from './usecases/admin/admin-create-permission-group.usecase.js';
import { AdminCreatePermissionUseCase } from './usecases/admin/admin-create-permission.usecase.js';
import { AdminDeletePermissionGroupUseCase } from './usecases/admin/admin-delete-permission-group.usecase.js';
import { AdminDeletePermissionUseCase } from './usecases/admin/admin-delete-permission.usecase.js';
import { AdminFindAllPermissionGroupsUseCase } from './usecases/admin/admin-find-all-permission-groups.usecase.js';
import { AdminFindPermissionGroupUseCase } from './usecases/admin/admin-find-permission-group.usecase.js';
import { AdminUpdatePermissionGroupUseCase } from './usecases/admin/admin-update-permission-group.usecase.js';
import { AdminUpdatePermissionUseCase } from './usecases/admin/admin-update-permission.usecase.js';
import { OperatorFindAllPermissionGroupsUseCase } from './usecases/operator/operator-find-all-permission-groups.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionGroup, Permission])],
  controllers: [
    AdminPermissionGroupsController,
    AdminPermissionController,
    OperatorPermissionGroupsController,
  ],
  providers: [
    AdminPermissionGroupRepository,
    AdminPermissionRepository,
    OperatorPermissionGroupRepository,
    OperatorPermissionRepository,
    AdminFindAllPermissionGroupsUseCase,
    AdminFindPermissionGroupUseCase,
    AdminCreatePermissionGroupUseCase,
    AdminUpdatePermissionGroupUseCase,
    AdminDeletePermissionGroupUseCase,
    AdminCreatePermissionUseCase,
    AdminUpdatePermissionUseCase,
    AdminDeletePermissionUseCase,
    OperatorFindAllPermissionGroupsUseCase,
  ],
  // Roles check the permissions granted to them: admin roles and company (operator) roles.
  exports: [AdminPermissionRepository, OperatorPermissionRepository],
})
export class PermissionsModule {}
