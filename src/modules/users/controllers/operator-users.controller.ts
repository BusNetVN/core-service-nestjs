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
import { OperatorCreateUserDto } from '../dto/operator/operator-create-user.dto.js';
import { OperatorUpdateUserDto } from '../dto/operator/operator-update-user.dto.js';
import { OperatorCreateUserUseCase } from '../usecases/operator/operator-create-user.usecase.js';
import { OperatorDeleteUserUseCase } from '../usecases/operator/operator-delete-user.usecase.js';
import { OperatorFindAllUsersUseCase } from '../usecases/operator/operator-find-all-users.usecase.js';
import { OperatorUpdateUserUseCase } from '../usecases/operator/operator-update-user.usecase.js';

/**
 * Nhân sự của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/users.
 *
 * - Chỉ làm việc với tài khoản COMPANY_STAFF của nhà xe trong access token; tài khoản khác
 *   (nhà xe khác, đại lý, quản trị hệ thống) -> 403.
 * - Không đổi được loại tài khoản hay nhà xe. Không tự khóa/xóa tài khoản đang đăng nhập.
 * - Dữ liệu trả về là OperatorUser (xem mappers/operator/operator-user.mapper.ts), kèm roles
 *   (nhóm quyền).
 */
@Controller('operator/users')
export class OperatorUsersController {
  constructor(
    private readonly findAllUsers: OperatorFindAllUsersUseCase,
    private readonly createUser: OperatorCreateUserUseCase,
    private readonly updateUser: OperatorUpdateUserUseCase,
    private readonly deleteUser: OperatorDeleteUserUseCase,
  ) {}

  /** GET /api/operator/users?q=... - nhân sự chưa bị xóa, mới tạo xếp trước. */
  @Get()
  @RequirePermission('USER_LIST')
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllUsers.execute(requiredCompanyUuidFromToken(user), query);
  }

  /**
   * POST /api/operator/users
   * Vào: { username, password, staff_role, full_name?, email?, phone?, role_ids?, status? }.
   * Lỗi: 400 dữ liệu hoặc nhóm quyền không hợp lệ; 409 tên đăng nhập/email đã tồn tại.
   */
  @Post()
  @RequirePermission('USER_CREATE')
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateUserDto,
  ) {
    return this.createUser.execute(
      requiredCompanyUuidFromToken(user),
      dto,
      user.username,
    );
  }

  /**
   * PATCH /api/operator/users/:id
   * Cập nhật một phần; password rỗng giữ mật khẩu cũ; role_ids thay toàn bộ nhóm quyền.
   */
  @Patch(':id')
  @RequirePermission('USER_UPDATE')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateUserDto,
  ) {
    return this.updateUser.execute(requiredCompanyUuidFromToken(user), id, dto, {
      uuid: user.sub,
      username: user.username,
    });
  }

  /** DELETE /api/operator/users/:id - xóa mềm và khóa tài khoản. */
  @Delete(':id')
  @RequirePermission('USER_DELETE')
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deleteUser.execute(requiredCompanyUuidFromToken(user), id, {
      uuid: user.sub,
      username: user.username,
    });
  }
}
