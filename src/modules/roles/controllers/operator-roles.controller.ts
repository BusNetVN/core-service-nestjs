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
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { requiredCompanyUuidFromToken } from '../../../common/utils/company-scope.js';
import { OperatorCreateRoleDto } from '../dto/operator/operator-create-role.dto.js';
import { OperatorUpdateRoleDto } from '../dto/operator/operator-update-role.dto.js';
import { OperatorCreateRoleUseCase } from '../usecases/operator/operator-create-role.usecase.js';
import { OperatorDeleteRoleUseCase } from '../usecases/operator/operator-delete-role.usecase.js';
import { OperatorFindAllRolesUseCase } from '../usecases/operator/operator-find-all-roles.usecase.js';
import { OperatorUpdateRoleUseCase } from '../usecases/operator/operator-update-role.usecase.js';

/**
 * Nhóm quyền của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/roles.
 *
 * - Luôn làm việc trên nhà xe trong access token (không nhận company_uuid); vai trò của
 *   nhà xe khác -> 403.
 * - Dữ liệu trả về là OperatorRole (xem mappers/operator/operator-role.mapper.ts),
 *   permissions kèm nhóm chức năng.
 */
@Controller('operator/roles')
export class OperatorRolesController {
  constructor(
    private readonly findAllRoles: OperatorFindAllRolesUseCase,
    private readonly createRole: OperatorCreateRoleUseCase,
    private readonly updateRole: OperatorUpdateRoleUseCase,
    private readonly deleteRole: OperatorDeleteRoleUseCase,
  ) {}

  /** GET /api/operator/roles?q=... - vai trò của nhà xe, sắp theo tên. */
  @Get()
  @RequirePermission('ROLE_LIST')
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllRoles.execute(requiredCompanyUuidFromToken(user), query);
  }

  /**
   * POST /api/operator/roles
   * Vào: { name, description?, is_active?, permission_ids? }.
   * Lỗi: 400 dữ liệu/chức năng không hợp lệ; 409 tên vai trò đã tồn tại trong nhà xe.
   */
  @Post()
  @RequirePermission('ROLE_CREATE')
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateRoleDto,
  ) {
    return this.createRole.execute(
      requiredCompanyUuidFromToken(user),
      dto,
      user.username,
    );
  }

  /** PATCH /api/operator/roles/:id - gửi permission_ids thì thay toàn bộ chức năng. */
  @Patch(':id')
  @RequirePermission('ROLE_UPDATE')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateRoleDto,
  ) {
    return this.updateRole.execute(
      requiredCompanyUuidFromToken(user),
      id,
      dto,
      user.username,
    );
  }

  /** DELETE /api/operator/roles/:id - vai trò bị gỡ khỏi các tài khoản đang được gán. */
  @Delete(':id')
  @RequirePermission('ROLE_DELETE')
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deleteRole.execute(requiredCompanyUuidFromToken(user), id);
  }
}
