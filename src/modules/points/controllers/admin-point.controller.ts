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
import { AdminCreatePointDto } from '../dto/admin/admin-create-point.dto.js';
import { AdminUpdatePointDto } from '../dto/admin/admin-update-point.dto.js';
import { AdminCreatePointUseCase } from '../usecases/admin/admin-create-point.usecase.js';
import { AdminDeletePointUseCase } from '../usecases/admin/admin-delete-point.usecase.js';
import { AdminFindAllPointsUseCase } from '../usecases/admin/admin-find-all-points.usecase.js';
import { AdminUpdatePointUseCase } from '../usecases/admin/admin-update-point.usecase.js';
import { AdminFindPointUseCase } from '../usecases/admin/admin-find-point.usecase.js';

/**
 * API quản lý điểm dừng cho trang quản trị (bnv-admin), prefix: /api/admin/points.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Quản trị viên quản lý điểm dừng DÙNG CHUNG (scope SYSTEM): tạo, sửa, xóa; và xem
 *   được mọi điểm dừng. Điểm dừng RIÊNG của nhà xe (scope COMPANY) do nhà xe quản lý qua
 *   /api/operator/points: ở đây chỉ xem, sửa/xóa trả 403.
 * - Dữ liệu trả về là AdminPoint (xem mappers/admin/admin-point.mapper.ts): `id` là uuid của điểm dừng, kèm
 *   scope/shared, nhà xe sở hữu (company, null với điểm dùng chung), tỉnh/xã, danh sách nhà
 *   xe được dùng (allowed_companies, rỗng = mọi nhà xe), created_by/updated_by (username)
 *   và created_at/updated_at.
 */
@Controller('admin/points')
@SystemAdminOnly()
export class AdminPointController {
  constructor(
    private readonly findAllPoints: AdminFindAllPointsUseCase,
    private readonly findPoint: AdminFindPointUseCase,
    private readonly createPoint: AdminCreatePointUseCase,
    private readonly updatePoint: AdminUpdatePointUseCase,
    private readonly deletePoint: AdminDeletePointUseCase,
  ) {}

  /**
   * GET /api/admin/points?scope=...&company_uuid=...&q=...
   * Lấy danh sách điểm dừng: điểm dùng chung trước, sau đó điểm của nhà xe (theo tên nhà xe),
   * trong mỗi nhóm sắp theo tên điểm.
   *
   * Vào: `scope` (tùy chọn) - `shared`: chỉ điểm dùng chung; `company`: chỉ điểm riêng của
   *      nhà xe; bỏ trống: tất cả.
   *      `company_uuid` (tùy chọn) - chỉ lấy điểm riêng của nhà xe này (không dùng cùng
   *      scope=shared).
   *      `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo mã, tên, loại, địa chỉ,
   *      ghi chú của điểm và tên, tên viết tắt, mã của nhà xe sở hữu.
   * Ra:  AdminPoint[].
   * Lỗi: 400 scope hoặc company_uuid không hợp lệ; 404 không tìm thấy nhà xe.
   */
  @Get()
  findAll(
    @Query('scope') scope?: string,
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllPoints.execute({ scope, companyUuid, query });
  }

  /**
   * GET /api/admin/points/:id
   * Xem chi tiết một điểm dừng (dùng chung hoặc của nhà xe).
   *
   * Vào: `id` - uuid v4 của điểm dừng (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  AdminPoint; không tồn tại -> 404 "Không tìm thấy điểm dừng.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findPoint.execute(id);
  }

  /**
   * POST /api/admin/points
   * Tạo điểm dừng dùng chung; created_by và updated_by ghi là username của tài khoản đang
   * đăng nhập.
   *
   * Vào: body AdminCreatePointDto - bắt buộc point_code, name, point_type (BEN_XE, VAN_PHONG,
   *      DOC_DUONG...); province_uuid, ward_uuid (xã phải thuộc tỉnh đã chọn), address, note,
   *      is_active (mặc định true), allowed_company_uuids (rỗng = mọi nhà xe được dùng) tùy chọn.
   *      Mã và tên phải không trùng với điểm dừng dùng chung (scope SYSTEM) khác; so sánh
   *      không phân biệt hoa thường, bỏ khoảng trắng đầu/cuối. Điểm riêng của nhà xe không
   *      tính là trùng.
   * Ra:  201 + AdminPoint vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ, tỉnh/xã không hợp lệ hoặc có nhà xe không tồn tại;
   *      409 "Mã điểm dừng dùng chung đã tồn tại." / "Tên điểm dừng dùng chung đã tồn tại.".
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreatePointDto,
  ) {
    return this.createPoint.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/points/:id
   * Cập nhật một phần điểm dừng dùng chung: chỉ đổi các trường có gửi lên, và luôn ghi
   * updated_by là username của tài khoản đang đăng nhập. Gửi allowed_company_uuids thì thay
   * toàn bộ danh sách nhà xe được dùng.
   *
   * Vào: `id` - uuid v4 của điểm dừng; body AdminUpdatePointDto (các trường của
   *      AdminCreatePointDto, đều tùy chọn).
   * Ra:  AdminPoint sau khi cập nhật.
   *      Mã/tên mới cũng không được trùng với điểm dừng dùng chung khác (giống khi tạo).
   * Lỗi: 400 dữ liệu không hợp lệ; 403 điểm riêng của nhà xe; 404 không tìm thấy;
   *      409 mã hoặc tên điểm dừng dùng chung đã tồn tại.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdatePointDto,
  ) {
    return this.updatePoint.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/points/:id
   * Xóa hẳn điểm dừng dùng chung khỏi database.
   *
   * Vào: `id` - uuid v4 của điểm dừng.
   * Ra:  { id, point_code } của điểm đã xóa.
   * Lỗi: 403 điểm riêng của nhà xe; 404 không tìm thấy; 409 điểm đang được dùng trong
   *      tuyến hoặc giá vé.
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deletePoint.execute(id);
  }
}
