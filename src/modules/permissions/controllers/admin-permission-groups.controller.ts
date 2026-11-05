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
import { AdminCreatePermissionGroupDto } from '../dto/admin/admin-create-permission-group.dto.js';
import { AdminCreatePermissionDto } from '../dto/admin/admin-create-permission.dto.js';
import { AdminUpdatePermissionGroupDto } from '../dto/admin/admin-update-permission-group.dto.js';
import { AdminCreatePermissionGroupUseCase } from '../usecases/admin/admin-create-permission-group.usecase.js';
import { AdminCreatePermissionUseCase } from '../usecases/admin/admin-create-permission.usecase.js';
import { AdminDeletePermissionGroupUseCase } from '../usecases/admin/admin-delete-permission-group.usecase.js';
import { AdminFindAllPermissionGroupsUseCase } from '../usecases/admin/admin-find-all-permission-groups.usecase.js';
import { AdminFindPermissionGroupUseCase } from '../usecases/admin/admin-find-permission-group.usecase.js';
import { AdminUpdatePermissionGroupUseCase } from '../usecases/admin/admin-update-permission-group.usecase.js';

/**
 * API quản lý nhóm chức năng (nhóm quyền) cho trang quản trị (bnv-admin),
 * prefix: /api/admin/permission-groups. Từng chức năng lẻ được sửa/xóa qua
 * AdminPermissionController (/api/admin/permissions).
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Dữ liệu trả về là AdminPermissionGroup (xem mappers/admin/admin-permission.mapper.ts): `id` là uuid của nhóm,
 *   code, name, description, sort_order, is_active, created_by/updated_by (username),
 *   created_at/updated_at và danh sách `permissions` của nhóm (sắp theo sort_order rồi theo tên).
 * - Tạo/sửa ghi created_by/updated_by là username của tài khoản đang đăng nhập; đổi mã nhóm
 *   thì các chức năng bị đổi tiền tố mã cũng được ghi updated_by.
 * - Mã nhóm và mã chức năng luôn được lưu chữ in hoa.
 */
@Controller('admin/permission-groups')
@SystemAdminOnly()
export class AdminPermissionGroupsController {
  constructor(
    private readonly findAllGroups: AdminFindAllPermissionGroupsUseCase,
    private readonly findGroup: AdminFindPermissionGroupUseCase,
    private readonly createGroup: AdminCreatePermissionGroupUseCase,
    private readonly updateGroup: AdminUpdatePermissionGroupUseCase,
    private readonly deleteGroup: AdminDeletePermissionGroupUseCase,
    private readonly createPermission: AdminCreatePermissionUseCase,
  ) {}

  /**
   * GET /api/admin/permission-groups?q=...
   * Lấy danh sách nhóm chức năng kèm các chức năng, sắp theo sort_order rồi theo tên nhóm.
   *
   * Vào: `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo mã/tên nhóm hoặc
   *      mã/tên chức năng; nhóm khớp sẽ trả về đầy đủ mọi chức năng của nhóm.
   * Ra:  AdminPermissionGroup[].
   */
  @Get()
  findAll(@Query('q') query?: string) {
    return this.findAllGroups.execute(query);
  }

  /**
   * GET /api/admin/permission-groups/:id
   * Xem chi tiết một nhóm chức năng kèm các chức năng.
   *
   * Vào: `id` - uuid v4 của nhóm (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  AdminPermissionGroup; không tồn tại -> 404 "Không tìm thấy nhóm chức năng.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findGroup.execute(id);
  }

  /**
   * POST /api/admin/permission-groups
   * Tạo nhóm chức năng. Mặc định tạo sẵn 4 chức năng chuẩn <MÃ>_CREATE, <MÃ>_UPDATE,
   * <MÃ>_DELETE, <MÃ>_LIST.
   *
   * Vào: body AdminCreatePermissionGroupDto - bắt buộc code (chữ hoa, số, dấu . _ -, tối đa 64 ký
   *      tự), name (tối đa 120 ký tự); description (tối đa 500), sort_order (0-9999, mặc định
   *      đứng cuối), is_active (mặc định true), seed_standard_permissions (mặc định true;
   *      false để không tạo 4 chức năng chuẩn) tùy chọn.
   * Ra:  201 + AdminPermissionGroup vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ hoặc mã nhóm quá dài để tạo chức năng chuẩn;
   *      409 mã nhóm đã tồn tại hoặc mã chức năng chuẩn đã tồn tại.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreatePermissionGroupDto,
  ) {
    return this.createGroup.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/permission-groups/:id
   * Cập nhật một phần nhóm chức năng: chỉ đổi các trường có gửi lên. Đổi mã nhóm thì tiền tố
   * mã của các chức năng trong nhóm cũng đổi theo (ví dụ OFFICE_LIST -> VAN_PHONG_LIST).
   *
   * Vào: `id` - uuid v4 của nhóm; body AdminUpdatePermissionGroupDto (code, name, description,
   *      sort_order, is_active, đều tùy chọn).
   * Ra:  AdminPermissionGroup sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ hoặc mã chức năng quá 64 ký tự sau khi đổi tiền tố;
   *      404 không tìm thấy; 409 mã nhóm đã tồn tại hoặc mã chức năng sau khi đổi bị trùng.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdatePermissionGroupDto,
  ) {
    return this.updateGroup.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/permission-groups/:id
   * Xóa hẳn nhóm chức năng cùng toàn bộ chức năng trong nhóm (ON DELETE CASCADE).
   *
   * Vào: `id` - uuid v4 của nhóm.
   * Ra:  { id, code, name } của nhóm đã xóa.
   * Lỗi: 404 không tìm thấy.
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deleteGroup.execute(id);
  }

  /**
   * POST /api/admin/permission-groups/:id/permissions
   * Thêm một chức năng vào nhóm.
   *
   * Vào: `id` - uuid v4 của nhóm; body AdminCreatePermissionDto - bắt buộc code (chữ hoa, số,
   *      dấu . _ -, tối đa 64 ký tự, không trùng trên toàn hệ thống), name (tối đa 120 ký tự,
   *      không trùng trong nhóm, không phân biệt hoa thường); description, sort_order (0-9999,
   *      mặc định đứng cuối nhóm), is_active (mặc định true) tùy chọn.
   * Ra:  201 + AdminPermission vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy nhóm; 409 mã chức năng đã tồn tại
   *      hoặc tên chức năng đã tồn tại trong nhóm.
   */
  @Post(':id/permissions')
  addPermission(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminCreatePermissionDto,
  ) {
    return this.createPermission.execute(id, dto, user.username);
  }
}
