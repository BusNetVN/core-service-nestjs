import { Controller, Get } from '@nestjs/common';
import { ApiPermission } from '../../../common/constants/api-permissions.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { FindAllPermissionGroupsUseCase } from '../usecases/find-all-permission-groups.usecase.js';

/**
 * Danh mục chức năng để gán cho nhóm quyền trong hệ thống vận hành (bnv-operator),
 * prefix: /api/operator/permission-groups. Chỉ đọc; quản lý danh mục ở bnv-admin.
 */
@Controller('operator/permission-groups')
export class OperatorPermissionGroupsController {
  constructor(private readonly findAllGroups: FindAllPermissionGroupsUseCase) {}

  /**
   * GET /api/operator/permission-groups
   * Ra: PublicPermissionGroup[] đang hoạt động, mỗi nhóm chỉ gồm chức năng đang hoạt động;
   *     nhóm không còn chức năng nào bị bỏ.
   */
  @Get()
  @RequirePermission(ApiPermission.ROLE_LIST)
  async findAll() {
    const groups = await this.findAllGroups.execute();
    return groups
      .filter((group) => group.is_active)
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter((permission) => permission.is_active),
      }))
      .filter((group) => group.permissions.length > 0);
  }
}
