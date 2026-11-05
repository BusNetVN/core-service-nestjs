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
import { OperatorCreateSeatMapDto } from '../dto/operator/operator-create-seat-map.dto.js';
import { OperatorUpdateSeatMapDto } from '../dto/operator/operator-update-seat-map.dto.js';
import { OperatorCreateSeatMapUseCase } from '../usecases/operator/operator-create-seat-map.usecase.js';
import { OperatorDeleteSeatMapUseCase } from '../usecases/operator/operator-delete-seat-map.usecase.js';
import { OperatorFindAllSeatMapsUseCase } from '../usecases/operator/operator-find-all-seat-maps.usecase.js';
import { OperatorFindSeatMapUseCase } from '../usecases/operator/operator-find-seat-map.usecase.js';
import { OperatorUpdateSeatMapUseCase } from '../usecases/operator/operator-update-seat-map.usecase.js';

/**
 * Sơ đồ ghế của nhà xe cho hệ thống vận hành (bnv-operator) và booking-service,
 * prefix: /api/operator/seat-maps.
 *
 * - Luôn làm việc trên nhà xe trong access token (không nhận company_uuid); sơ đồ của nhà xe
 *   khác -> 403.
 * - Tạo/sửa ghi created_by/updated_by là username của tài khoản đang đăng nhập.
 * - Dữ liệu trả về là OperatorSeatMap (xem mappers/operator/operator-seat-map.mapper.ts).
 */
@Controller('operator/seat-maps')
export class OperatorSeatMapController {
  constructor(
    private readonly findAllSeatMaps: OperatorFindAllSeatMapsUseCase,
    private readonly findSeatMap: OperatorFindSeatMapUseCase,
    private readonly createSeatMap: OperatorCreateSeatMapUseCase,
    private readonly updateSeatMap: OperatorUpdateSeatMapUseCase,
    private readonly deleteSeatMap: OperatorDeleteSeatMapUseCase,
  ) {}

  /**
   * GET /api/operator/seat-maps?q=...
   * Sơ đồ ghế của nhà xe, mới tạo trước. `q` tìm theo mã, tên, loại, ghi chú.
   */
  @Get()
  @RequirePermission('SEAT_MAP_LIST')
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllSeatMaps.execute(requiredCompanyUuidFromToken(user), query);
  }

  /** GET /api/operator/seat-maps/:id - booking-service đọc để sinh vé của chuyến. */
  @Get(':id')
  @RequirePermission('SEAT_MAP_LIST')
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.findSeatMap.execute(requiredCompanyUuidFromToken(user), id);
  }

  /**
   * POST /api/operator/seat-maps
   * Vào: OperatorCreateSeatMapDto (bắt buộc seat_map_code).
   * Lỗi: 400 dữ liệu không hợp lệ; 409 mã sơ đồ đã tồn tại trong nhà xe.
   */
  @Post()
  @RequirePermission('SEAT_MAP_CREATE')
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateSeatMapDto,
  ) {
    return this.createSeatMap.execute(
      requiredCompanyUuidFromToken(user),
      dto,
      user.username,
    );
  }

  /** PATCH /api/operator/seat-maps/:id - cập nhật một phần; không đổi được nhà xe. */
  @Patch(':id')
  @RequirePermission('SEAT_MAP_UPDATE')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateSeatMapDto,
  ) {
    return this.updateSeatMap.execute(
      requiredCompanyUuidFromToken(user),
      id,
      dto,
      user.username,
    );
  }

  /** DELETE /api/operator/seat-maps/:id */
  @Delete(':id')
  @RequirePermission('SEAT_MAP_DELETE')
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deleteSeatMap.execute(requiredCompanyUuidFromToken(user), id);
  }
}
