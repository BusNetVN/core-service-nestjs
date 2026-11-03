import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountType } from '../../../common/constants/account.constant.js';
import { ApiPermission } from '../../../common/constants/api-permissions.js';
import { ErrorMessage } from '../../../common/constants/error-message.constant.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { requiredCompanyUuidFromToken } from '../../../common/utils/company-scope.js';
import {
  OperatorCreateStaffDto,
  OperatorUpdateStaffDto,
} from '../dto/operator/operator-staff.dto.js';
import { AdminCreateUserUseCase } from '../usecases/admin/admin-create-user.usecase.js';
import { AdminDeleteUserUseCase } from '../usecases/admin/admin-delete-user.usecase.js';
import { AdminFindAllUsersUseCase } from '../usecases/admin/admin-find-all-users.usecase.js';
import { AdminFindUserUseCase } from '../usecases/admin/admin-find-user.usecase.js';
import { AdminUpdateUserUseCase } from '../usecases/admin/admin-update-user.usecase.js';

/**
 * Nhân sự của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/staff.
 *
 * - Chỉ làm việc với tài khoản COMPANY_STAFF của nhà xe trong access token; tài khoản khác
 *   (nhà xe khác, đại lý, quản trị hệ thống) -> 403.
 * - Không đổi được loại tài khoản hay nhà xe. Không tự khóa/xóa tài khoản đang đăng nhập.
 * - Dữ liệu trả về là PublicUser (xem user.mapper.ts), kèm roles (nhóm quyền).
 */
@Controller('operator/staff')
export class OperatorStaffController {
  constructor(
    private readonly findAllUsers: AdminFindAllUsersUseCase,
    private readonly findUser: AdminFindUserUseCase,
    private readonly createUser: AdminCreateUserUseCase,
    private readonly updateUser: AdminUpdateUserUseCase,
    private readonly deleteUser: AdminDeleteUserUseCase,
  ) {}

  /** GET /api/operator/staff?q=... - nhân sự chưa bị xóa, mới tạo xếp trước. */
  @Get()
  @RequirePermission(ApiPermission.STAFF_LIST)
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllUsers.execute({
      companyUuid: requiredCompanyUuidFromToken(user),
      accountType: AccountType.COMPANY_STAFF,
      query,
    });
  }

  /**
   * POST /api/operator/staff
   * Vào: { username, password, staff_role, full_name?, email?, phone?, role_ids?, status? }.
   * Lỗi: 400 dữ liệu hoặc nhóm quyền không hợp lệ; 409 tên đăng nhập/email đã tồn tại.
   */
  @Post()
  @RequirePermission(ApiPermission.STAFF_CREATE)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateStaffDto,
  ) {
    return this.createUser.execute(
      {
        ...dto,
        account_type: AccountType.COMPANY_STAFF,
        company_uuid: requiredCompanyUuidFromToken(user),
      },
      user.username,
    );
  }

  /**
   * PATCH /api/operator/staff/:id
   * Cập nhật một phần; password rỗng giữ mật khẩu cũ; role_ids thay toàn bộ nhóm quyền.
   */
  @Patch(':id')
  @RequirePermission(ApiPermission.STAFF_UPDATE)
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateStaffDto,
  ) {
    await this.assertCompanyStaff(user, id);
    return this.updateUser.execute(id, dto, {
      uuid: user.sub,
      username: user.username,
    });
  }

  /** DELETE /api/operator/staff/:id - xóa mềm và khóa tài khoản. */
  @Delete(':id')
  @RequirePermission(ApiPermission.STAFF_DELETE)
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    await this.assertCompanyStaff(user, id);
    return this.deleteUser.execute(id, {
      uuid: user.sub,
      username: user.username,
    });
  }

  private async assertCompanyStaff(user: AccessTokenPayload, id: string) {
    const companyUuid = requiredCompanyUuidFromToken(user);
    const staff = await this.findUser.execute(id);
    if (
      staff.company_uuid !== companyUuid ||
      staff.account_type !== AccountType.COMPANY_STAFF
    ) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
    }
  }
}
