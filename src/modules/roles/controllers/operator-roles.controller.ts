import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiPermission } from '../../../common/constants/api-permissions.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import {
  assertCompanyResource,
  requiredCompanyUuidFromToken,
} from '../../../common/utils/company-scope.js';
import {
  OperatorCreateRoleDto,
  OperatorUpdateRoleDto,
} from '../dto/operator/operator-role.dto.js';
import { AdminCreateRoleUseCase } from '../usecases/admin/admin-create-role.usecase.js';
import { AdminDeleteRoleUseCase } from '../usecases/admin/admin-delete-role.usecase.js';
import { AdminFindAllRolesUseCase } from '../usecases/admin/admin-find-all-roles.usecase.js';
import { AdminFindRoleUseCase } from '../usecases/admin/admin-find-role.usecase.js';
import { AdminUpdateRoleUseCase } from '../usecases/admin/admin-update-role.usecase.js';

/**
 * Nhóm quyền của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/roles.
 *
 * - Luôn làm việc trên nhà xe trong access token; vai trò của nhà xe khác -> 403.
 * - Dữ liệu trả về là PublicRole (xem role.mapper.ts), permissions kèm nhóm chức năng.
 */
@Controller('operator/roles')
export class OperatorRolesController {
  constructor(
    private readonly findAllRoles: AdminFindAllRolesUseCase,
    private readonly findRole: AdminFindRoleUseCase,
    private readonly createRole: AdminCreateRoleUseCase,
    private readonly updateRole: AdminUpdateRoleUseCase,
    private readonly deleteRole: AdminDeleteRoleUseCase,
  ) {}

  /** GET /api/operator/roles?q=... - vai trò của nhà xe, sắp theo tên. */
  @Get()
  @RequirePermission(ApiPermission.ROLE_LIST)
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllRoles.execute({
      companyUuid: requiredCompanyUuidFromToken(user),
      query,
    });
  }

  /**
   * POST /api/operator/roles
   * Vào: { name, description?, is_active?, permission_ids? }.
   * Lỗi: 400 dữ liệu/chức năng không hợp lệ; 409 tên vai trò đã tồn tại trong nhà xe.
   */
  @Post()
  @RequirePermission(ApiPermission.ROLE_CREATE)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateRoleDto,
  ) {
    return this.createRole.execute(
      { ...dto, company_uuid: requiredCompanyUuidFromToken(user) },
      user.username,
    );
  }

  /** PATCH /api/operator/roles/:id - gửi permission_ids thì thay toàn bộ chức năng. */
  @Patch(':id')
  @RequirePermission(ApiPermission.ROLE_UPDATE)
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateRoleDto,
  ) {
    const role = await this.findRole.execute(id);
    assertCompanyResource(user, role.company_uuid);
    return this.updateRole.execute(id, dto, user.username);
  }

  /** DELETE /api/operator/roles/:id - vai trò bị gỡ khỏi các tài khoản đang được gán. */
  @Delete(':id')
  @RequirePermission(ApiPermission.ROLE_DELETE)
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const role = await this.findRole.execute(id);
    assertCompanyResource(user, role.company_uuid);
    return this.deleteRole.execute(id);
  }
}
