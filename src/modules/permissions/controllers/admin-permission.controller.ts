import { Body, Controller, Delete, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { SystemAdminOnly } from '../../../common/decorators/system-admin-only.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { AdminUpdatePermissionDto } from '../dto/admin/admin-update-permission.dto.js';
import { AdminDeletePermissionUseCase } from '../usecases/admin/admin-delete-permission.usecase.js';
import { AdminUpdatePermissionUseCase } from '../usecases/admin/admin-update-permission.usecase.js';

/**
 * API sửa/xóa từng chức năng (quyền) cho trang quản trị (bnv-admin), prefix: /api/admin/permissions.
 * Xem danh sách và thêm chức năng thực hiện theo nhóm qua AdminPermissionGroupsController
 * (/api/admin/permission-groups).
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Dữ liệu trả về là AdminPermission (xem mappers/admin/admin-permission.mapper.ts): `id` là uuid của chức năng,
 *   code, name, description, sort_order, is_active, created_by/updated_by (username),
 *   created_at/updated_at. Sửa chức năng ghi updated_by là username của tài khoản đang đăng nhập.
 */
@Controller('admin/permissions')
@SystemAdminOnly()
export class AdminPermissionController {
  constructor(
    private readonly updatePermission: AdminUpdatePermissionUseCase,
    private readonly deletePermission: AdminDeletePermissionUseCase,
  ) {}

  /**
   * PATCH /api/admin/permissions/:id
   * Cập nhật một phần chức năng: chỉ đổi các trường có gửi lên. Không chuyển được chức năng
   * sang nhóm khác.
   *
   * Vào: `id` - uuid v4 của chức năng; body AdminUpdatePermissionDto (code, name, description,
   *      sort_order 0-9999, is_active, đều tùy chọn). Mã được lưu chữ in hoa.
   * Ra:  AdminPermission sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy; 409 mã chức năng đã tồn tại hoặc tên
   *      chức năng đã tồn tại trong nhóm (không phân biệt hoa thường).
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdatePermissionDto,
  ) {
    return this.updatePermission.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/permissions/:id
   * Xóa hẳn một chức năng khỏi nhóm.
   *
   * Vào: `id` - uuid v4 của chức năng.
   * Ra:  { id, code, name } của chức năng đã xóa.
   * Lỗi: 404 không tìm thấy.
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deletePermission.execute(id);
  }
}
