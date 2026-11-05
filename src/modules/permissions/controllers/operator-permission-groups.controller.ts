import { Controller, Get } from '@nestjs/common';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { OperatorFindAllPermissionGroupsUseCase } from '../usecases/operator/operator-find-all-permission-groups.usecase.js';

/**
 * Danh mục chức năng để gán cho nhóm quyền trong hệ thống vận hành (bnv-operator),
 * prefix: /api/operator/permission-groups. Chỉ đọc; quản lý danh mục ở bnv-admin.
 */
@Controller('operator/permission-groups')
export class OperatorPermissionGroupsController {
  constructor(
    private readonly findAllGroups: OperatorFindAllPermissionGroupsUseCase,
  ) {}

  /**
   * GET /api/operator/permission-groups
   * Ra: OperatorPermissionGroup[] (xem mappers/operator/operator-permission.mapper.ts) đang
   *     hoạt động, mỗi nhóm chỉ gồm chức năng đang hoạt động; nhóm không còn chức năng nào bị bỏ.
   */
  @Get()
  @RequirePermission('PERMISSION_LIST')
  findAll() {
    return this.findAllGroups.execute();
  }
}
