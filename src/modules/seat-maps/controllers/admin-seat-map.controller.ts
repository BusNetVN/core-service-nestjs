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
import { AdminCreateSeatMapDto } from '../dto/admin/admin-create-seat-map.dto.js';
import { AdminUpdateSeatMapDto } from '../dto/admin/admin-update-seat-map.dto.js';
import { AdminCreateSeatMapUseCase } from '../usecases/admin/admin-create-seat-map.usecase.js';
import { AdminDeleteSeatMapUseCase } from '../usecases/admin/admin-delete-seat-map.usecase.js';
import { AdminFindAllSeatMapsUseCase } from '../usecases/admin/admin-find-all-seat-maps.usecase.js';
import { AdminFindSeatMapUseCase } from '../usecases/admin/admin-find-seat-map.usecase.js';
import { AdminUpdateSeatMapUseCase } from '../usecases/admin/admin-update-seat-map.usecase.js';

/**
 * API quản lý sơ đồ ghế của mọi nhà xe cho trang quản trị (bnv-admin),
 * prefix: /api/admin/seat-maps.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Mã sơ đồ không trùng trong cùng nhà xe. Tạo/sửa ghi created_by/updated_by là username của
 *   tài khoản đang đăng nhập.
 * - Dữ liệu trả về là AdminSeatMap (xem mappers/admin/admin-seat-map.mapper.ts).
 */
@Controller('admin/seat-maps')
@SystemAdminOnly()
export class AdminSeatMapController {
  constructor(
    private readonly findAllSeatMaps: AdminFindAllSeatMapsUseCase,
    private readonly findSeatMap: AdminFindSeatMapUseCase,
    private readonly createSeatMap: AdminCreateSeatMapUseCase,
    private readonly updateSeatMap: AdminUpdateSeatMapUseCase,
    private readonly deleteSeatMap: AdminDeleteSeatMapUseCase,
  ) {}

  /**
   * GET /api/admin/seat-maps?company_uuid=...&q=...
   * `company_uuid` (tùy chọn) chỉ lấy sơ đồ của nhà xe đó; `q` tìm theo mã, tên, loại, ghi chú.
   */
  @Get()
  findAll(
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllSeatMaps.execute({ companyUuid, query });
  }

  /** GET /api/admin/seat-maps/:id */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findSeatMap.execute(id);
  }

  /**
   * POST /api/admin/seat-maps
   * Vào: AdminCreateSeatMapDto (bắt buộc company_uuid, seat_map_code).
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy nhà xe; 409 mã sơ đồ đã tồn tại.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreateSeatMapDto,
  ) {
    return this.createSeatMap.execute(dto, user.username);
  }

  /** PATCH /api/admin/seat-maps/:id - cập nhật một phần; không đổi được nhà xe. */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdateSeatMapDto,
  ) {
    return this.updateSeatMap.execute(id, dto, user.username);
  }

  /** DELETE /api/admin/seat-maps/:id */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deleteSeatMap.execute(id);
  }
}
