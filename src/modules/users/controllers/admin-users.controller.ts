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
import { SystemAdminOnly } from '../../../common/decorators/system-admin-only.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { AdminCreateUserDto } from '../dto/admin/admin-create-user.dto.js';
import { AdminUpdateUserDto } from '../dto/admin/admin-update-user.dto.js';
import { AdminCreateUserUseCase } from '../usecases/admin/admin-create-user.usecase.js';
import { AdminDeleteUserUseCase } from '../usecases/admin/admin-delete-user.usecase.js';
import { AdminFindAllUsersUseCase } from '../usecases/admin/admin-find-all-users.usecase.js';
import { AdminFindUserUseCase } from '../usecases/admin/admin-find-user.usecase.js';
import { AdminUpdateUserUseCase } from '../usecases/admin/admin-update-user.usecase.js';

/**
 * API quản lý tài khoản người dùng cho trang quản trị (bnv-admin), prefix: /api/admin/users.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Loại tài khoản (account_type): CUSTOMER, COMPANY_STAFF, SYSTEM_ADMIN, AGENCY.
 *   COMPANY_STAFF và AGENCY bắt buộc thuộc một nhà xe (company_uuid); COMPANY_STAFF bắt buộc
 *   có vai trò (staff_role: ADMIN, STAFF, DRIVER, ASSISTANT). Loại khác thì nhà xe/vai trò bị bỏ.
 * - Tài khoản thuộc nhà xe được gán nhiều nhóm quyền (role_ids: uuid vai trò của chính nhà
 *   xe đó, lưu ở tbl_user_roles). Đổi nhà xe mà không gửi role_ids thì bỏ các nhóm quyền
 *   của nhà xe cũ; tài khoản không thuộc nhà xe thì không có nhóm quyền.
 * - Xóa là xóa mềm: giữ bản ghi (tên đăng nhập vẫn bị giữ chỗ), khóa tài khoản và ẩn khỏi
 *   danh sách; tài khoản đã xóa được coi như không tồn tại (404).
 * - Tạo/sửa/xóa ghi created_by/updated_by là username của tài khoản đang đăng nhập.
 * - Dữ liệu trả về là AdminUser (xem mappers/admin/admin-user.mapper.ts): `id` là uuid, username, full_name,
 *   email, phone, company_uuid, account_type, staff_role, roles ({ id, name }[] sắp theo
 *   tên), status, created_by/updated_by, created_at/updated_at. Không bao giờ trả về mật khẩu.
 */
@Controller('admin/users')
@SystemAdminOnly()
export class AdminUsersController {
  constructor(
    private readonly findAllUsers: AdminFindAllUsersUseCase,
    private readonly findUser: AdminFindUserUseCase,
    private readonly createUser: AdminCreateUserUseCase,
    private readonly updateUser: AdminUpdateUserUseCase,
    private readonly deleteUser: AdminDeleteUserUseCase,
  ) {}

  /**
   * GET /api/admin/users?q=...&company_uuid=...
   * Lấy danh sách tài khoản chưa bị xóa, mới tạo xếp trước.
   *
   * Vào: `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo tên đăng nhập, họ tên,
   *      email, số điện thoại.
   *      `company_uuid` (tùy chọn) - chỉ lấy tài khoản thuộc nhà xe này.
   * Ra:  AdminUser[].
   * Lỗi: 400 company_uuid sai định dạng.
   */
  @Get()
  findAll(
    @Query('q') query?: string,
    @Query('company_uuid') companyUuid?: string,
  ) {
    return this.findAllUsers.execute({ companyUuid, query });
  }

  /**
   * GET /api/admin/users/:id
   * Xem chi tiết một tài khoản.
   *
   * Vào: `id` - uuid v4 của tài khoản (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  AdminUser; không tồn tại hoặc đã xóa -> 404 "Không tìm thấy người dùng.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findUser.execute(id);
  }

  /**
   * POST /api/admin/users
   * Tạo tài khoản; created_by và updated_by ghi là username của tài khoản đang đăng nhập.
   *
   * Vào: body AdminCreateUserDto - bắt buộc username (chữ, số, dấu . _ -, tối đa 64 ký tự, lưu chữ
   *      thường), password (8-72 ký tự, lưu dạng bcrypt), account_type; full_name, email (lưu
   *      chữ thường), phone, company_uuid, staff_role, role_ids, status (mặc định true) tùy chọn.
   * Ra:  201 + AdminUser vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ, thiếu nhà xe/vai trò theo loại tài khoản, nhà xe không
   *      tồn tại hoặc nhóm quyền không thuộc nhà xe; 409 tên đăng nhập đã tồn tại (kể cả tài khoản đã xóa) hoặc email đã tồn tại.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreateUserDto,
  ) {
    return this.createUser.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/users/:id
   * Cập nhật một phần tài khoản: trường không gửi hoặc null giữ nguyên; password rỗng thì giữ
   * mật khẩu cũ. Luôn ghi updated_by là username của tài khoản đang đăng nhập.
   *
   * Vào: `id` - uuid v4 của tài khoản; body AdminUpdateUserDto (các trường của
   *      AdminCreateUserDto, đều tùy chọn). Gửi role_ids thì thay toàn bộ nhóm quyền.
   * Ra:  AdminUser sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ, nhóm quyền không thuộc nhà xe hoặc tự khóa / tự đổi loại
   *      tài khoản đang đăng nhập;
   *      404 không tìm thấy; 409 tên đăng nhập hoặc email đã tồn tại.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.updateUser.execute(id, dto, {
      uuid: user.sub,
      username: user.username,
    });
  }

  /**
   * DELETE /api/admin/users/:id
   * Xóa mềm tài khoản (gắn deleted_at, khóa tài khoản, ghi updated_by).
   *
   * Vào: `id` - uuid v4 của tài khoản.
   * Ra:  { id, username } của tài khoản đã xóa.
   * Lỗi: 400 xóa chính tài khoản đang đăng nhập; 404 không tìm thấy hoặc đã xóa.
   */
  @Delete(':id')
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deleteUser.execute(id, {
      uuid: user.sub,
      username: user.username,
    });
  }
}
