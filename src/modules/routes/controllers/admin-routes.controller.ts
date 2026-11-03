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
import { AdminCreateRouteDto } from '../dto/admin/admin-create-route.dto.js';
import { AdminUpdateRouteDto } from '../dto/admin/admin-update-route.dto.js';
import { ReorderRoutesDto } from '../dto/reorder-routes.dto.js';
import { AdminCreateRouteUseCase } from '../usecases/admin/admin-create-route.usecase.js';
import { AdminDeleteRouteUseCase } from '../usecases/admin/admin-delete-route.usecase.js';
import { AdminFindAllRoutesUseCase } from '../usecases/admin/admin-find-all-route.usecase.js';
import { AdminUpdateRouteUseCase } from '../usecases/admin/admin-update-route.usecase.js';
import { FindRouteUseCase } from '../usecases/find-route.usecase.js';
import { ReorderRoutesUseCase } from '../usecases/reorder-routes.usecase.js';

/**
 * API quản lý tuyến đường cho trang quản trị (bnv-admin), prefix: /api/admin/routes.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Khác RoutesController (/api/routes, dành cho nhân viên nhà xe): không giới hạn theo
 *   nhà xe của người gọi, danh sách không bắt buộc company_uuid, và DTO kiểm tra chặt hơn.
 *   Điểm dừng của tuyến vẫn dùng /api/routes.
 * - Dữ liệu trả về là PublicRoute (xem route.mapper.ts): `id` là uuid của tuyến, kèm
 *   company_uuid, thông tin nhà xe (company), created_by/updated_by (username) và
 *   created_at/updated_at.
 */
@Controller('admin/routes')
@SystemAdminOnly()
export class AdminRoutesController {
  constructor(
    private readonly findAllRoutes: AdminFindAllRoutesUseCase,
    private readonly findRoute: FindRouteUseCase,
    private readonly createRoute: AdminCreateRouteUseCase,
    private readonly updateRoute: AdminUpdateRouteUseCase,
    private readonly deleteRoute: AdminDeleteRouteUseCase,
    private readonly reorderRoutes: ReorderRoutesUseCase,
  ) {}

  /**
   * GET /api/admin/routes?company_uuid=...&q=...
   * Lấy danh sách tuyến, sắp theo tên nhà xe rồi thứ tự tuyến (sort_order) của nhà xe.
   *
   * Vào: `company_uuid` (tùy chọn) - chỉ lấy tuyến của nhà xe này; bỏ trống thì lấy tất cả.
   *      `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo mã, tên, điểm đi,
   *      điểm đến, ghi chú của tuyến và tên, tên viết tắt, mã của nhà xe.
   * Ra:  PublicRoute[].
   * Lỗi: 400 company_uuid sai định dạng; 404 không tìm thấy nhà xe.
   */
  @Get()
  findAll(
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllRoutes.execute({ companyUuid, query });
  }

  /**
   * GET /api/admin/routes/:id
   * Xem chi tiết một tuyến.
   *
   * Vào: `id` - uuid v4 của tuyến (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  PublicRoute; không tồn tại -> 404 "Không tìm thấy tuyến đường.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findRoute.execute(id);
  }

  /**
   * POST /api/admin/routes
   * Tạo tuyến cho nhà xe bất kỳ, xếp cuối danh sách tuyến của nhà xe; created_by và
   * updated_by ghi là username của tài khoản đang đăng nhập.
   *
   * Vào: body AdminCreateRouteDto - bắt buộc company_uuid, route_code, origin, destination;
   *      name bỏ trống thì tự đặt "<điểm đi> - <điểm đến>"; distance_km (1-10000 km),
   *      duration_minutes (1-10080 phút), note, status (mặc định true) đều tùy chọn.
   * Ra:  201 + PublicRoute vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy nhà xe; 409 mã tuyến đã tồn tại
   *      trong nhà xe.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreateRouteDto,
  ) {
    return this.createRoute.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/routes/reorder
   * Sắp xếp lại thứ tự hiển thị (sort_order) các tuyến của một nhà xe, ví dụ sau khi kéo thả.
   * Đổi vị trí được tính là cập nhật bản ghi: tuyến nào đổi vị trí thì được ghi updated_by
   * (username của tài khoản đang đăng nhập) và updated_at; tuyến giữ nguyên vị trí thì không đổi.
   * Khai báo trước PATCH :id để "reorder" không bị hiểu là id.
   *
   * Vào: body { company_uuid, ids } - ids là uuid của TẤT CẢ tuyến thuộc nhà xe, theo thứ tự
   *      mới (phần tử đầu tiên có sort_order = 0).
   * Ra:  PublicRoute[] của nhà xe theo thứ tự mới.
   * Lỗi: 400 ids thiếu, thừa hoặc có tuyến không thuộc nhà xe; 404 không tìm thấy nhà xe.
   */
  @Patch('reorder')
  reorder(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ReorderRoutesDto,
  ) {
    return this.reorderRoutes.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/routes/:id
   * Cập nhật một phần thông tin tuyến: chỉ đổi các trường có gửi lên, và luôn ghi
   * updated_by là username của tài khoản đang đăng nhập. Nếu tên tuyến đang là tên tự
   * sinh từ điểm đi - điểm đến thì tên được cập nhật theo khi đổi điểm đi/đến.
   *
   * Vào: `id` - uuid v4 của tuyến; body AdminUpdateRouteDto (các trường của
   *      AdminCreateRouteDto trừ company_uuid, đều tùy chọn; gửi company_uuid -> 400).
   * Ra:  PublicRoute sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy; 409 mã tuyến đã tồn tại trong nhà xe.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdateRouteDto,
  ) {
    return this.updateRoute.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/routes/:id
   * Xóa hẳn tuyến khỏi database, kèm các điểm dừng của tuyến.
   *
   * Vào: `id` - uuid v4 của tuyến.
   * Ra:  { id, route_code } của tuyến đã xóa.
   * Lỗi: 404 không tìm thấy; 409 tuyến đang được dùng trong lịch chạy hoặc giá vé.
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deleteRoute.execute(id);
  }
}
