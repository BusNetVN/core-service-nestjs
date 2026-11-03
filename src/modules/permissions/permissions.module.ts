import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPermissionGroupsController } from './controllers/admin-permission-groups.controller.js';
import { AdminPermissionController } from './controllers/admin-permission.controller.js';
import { OperatorPermissionGroupsController } from './controllers/operator-permission-groups.controller.js';
import { PermissionGroup } from './entities/permission-group.entity.js';
import { Permission } from './entities/permission.entity.js';
import { PermissionGroupRepository } from './repository/permission-group.repository.js';
import { PermissionRepository } from './repository/permission.repository.js';
import { CreatePermissionGroupUseCase } from './usecases/create-permission-group.usecase.js';
import { CreatePermissionUseCase } from './usecases/create-permission.usecase.js';
import { FindAllPermissionGroupsUseCase } from './usecases/find-all-permission-groups.usecase.js';
import { FindPermissionGroupUseCase } from './usecases/find-permission-group.usecase.js';
import { RemovePermissionGroupUseCase } from './usecases/remove-permission-group.usecase.js';
import { RemovePermissionUseCase } from './usecases/remove-permission.usecase.js';
import { UpdatePermissionGroupUseCase } from './usecases/update-permission-group.usecase.js';
import { UpdatePermissionUseCase } from './usecases/update-permission.usecase.js';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionGroup, Permission])],
  controllers: [
    AdminPermissionGroupsController,
    AdminPermissionController,
    OperatorPermissionGroupsController,
  ],
  providers: [
    PermissionGroupRepository,
    PermissionRepository,
    FindAllPermissionGroupsUseCase,
    FindPermissionGroupUseCase,
    CreatePermissionGroupUseCase,
    UpdatePermissionGroupUseCase,
    RemovePermissionGroupUseCase,
    CreatePermissionUseCase,
    UpdatePermissionUseCase,
    RemovePermissionUseCase,
  ],
  exports: [PermissionRepository],
})
export class PermissionsModule {}
