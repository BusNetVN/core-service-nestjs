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
import { AdminCreateRoleDto } from '../dto/admin/admin-create-role.dto.js';
import { AdminUpdateRoleDto } from '../dto/admin/admin-update-role.dto.js';
import { AdminCreateRoleUseCase } from '../usecases/admin/admin-create-role.usecase.js';
import { AdminDeleteRoleUseCase } from '../usecases/admin/admin-delete-role.usecase.js';
import { AdminFindAllRolesUseCase } from '../usecases/admin/admin-find-all-roles.usecase.js';
import { AdminFindRoleUseCase } from '../usecases/admin/admin-find-role.usecase.js';
import { AdminUpdateRoleUseCase } from '../usecases/admin/admin-update-role.usecase.js';

/**
 * API quản lý vai trò của nhà xe cho trang quản trị (bnv-admin), prefix: /api/admin/roles.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Mỗi vai trò thuộc một nhà xe và được gán danh sách chức năng (tbl_permissions) qua
 *   bảng tbl_role_permissions.
 * - Dữ liệu trả về là PublicRole (xem role.mapper.ts): `id` là uuid của vai trò, kèm
 *   company_uuid, permissions ({ id, code, name }[] sắp theo mã), created_by/updated_by
 *   (username) và created_at/updated_at.
 */
@Controller('admin/roles')
@SystemAdminOnly()
export class AdminRolesController {
  constructor(
    private readonly findAllRoles: AdminFindAllRolesUseCase,
    private readonly findRole: AdminFindRoleUseCase,
    private readonly createRole: AdminCreateRoleUseCase,
    private readonly updateRole: AdminUpdateRoleUseCase,
    private readonly deleteRole: AdminDeleteRoleUseCase,
  ) {}

  /**
   * GET /api/admin/roles?company_uuid=...&q=...
   * Lấy danh sách vai trò, sắp theo tên nhà xe rồi tên vai trò.
   *
   * Vào: `company_uuid` (tùy chọn) - chỉ lấy vai trò của nhà xe này; bỏ trống thì lấy tất cả.
   *      `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo tên, mô tả.
   * Ra:  PublicRole[].
   * Lỗi: 400 company_uuid sai định dạng; 404 không tìm thấy nhà xe.
   */
  @Get()
  findAll(
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllRoles.execute({ companyUuid, query });
  }

  /**
   * GET /api/admin/roles/:id
   * Xem chi tiết một vai trò.
   *
   * Vào: `id` - uuid v4 của vai trò (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  PublicRole; không tồn tại -> 404 "Không tìm thấy vai trò.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findRole.execute(id);
  }

  /**
   * POST /api/admin/roles
   * Tạo vai trò cho nhà xe; created_by và updated_by ghi là username của tài khoản
   * đang đăng nhập.
   *
   * Vào: body AdminCreateRoleDto - bắt buộc company_uuid, name; description, is_active
   *      (mặc định true), permission_ids (uuid chức năng) tùy chọn.
   * Ra:  201 + PublicRole vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ hoặc chức năng không tồn tại; 404 không tìm thấy nhà xe;
   *      409 tên vai trò đã tồn tại trong nhà xe.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreateRoleDto,
  ) {
    return this.createRole.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/roles/:id
   * Cập nhật một phần vai trò: chỉ đổi các trường có gửi lên, và luôn ghi updated_by là
   * username của tài khoản đang đăng nhập. Gửi permission_ids thì thay toàn bộ danh sách
   * chức năng của vai trò. Không đổi được nhà xe của vai trò.
   *
   * Vào: `id` - uuid v4 của vai trò; body AdminUpdateRoleDto (các trường của AdminCreateRoleDto trừ
   *      company_uuid, đều tùy chọn; gửi company_uuid -> 400).
   * Ra:  PublicRole sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ hoặc chức năng không tồn tại; 404 không tìm thấy;
   *      409 tên vai trò đã tồn tại trong nhà xe.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdateRoleDto,
  ) {
    return this.updateRole.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/roles/:id
   * Xóa hẳn vai trò cùng các chức năng đã gán cho vai trò.
   *
   * Vào: `id` - uuid v4 của vai trò.
   * Ra:  { id, name } của vai trò đã xóa.
   * Lỗi: 404 không tìm thấy.
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deleteRole.execute(id);
  }
}
