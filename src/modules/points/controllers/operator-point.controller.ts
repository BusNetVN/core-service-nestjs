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
import { OperatorCreatePointDto } from '../dto/operator/operator-create-point.dto.js';
import { OperatorUpdatePointDto } from '../dto/operator/operator-update-point.dto.js';
import { OperatorCreatePointUseCase } from '../usecases/operator/operator-create-point.usecase.js';
import { OperatorDeletePointUseCase } from '../usecases/operator/operator-delete-point.usecase.js';
import { OperatorFindAllPointsUseCase } from '../usecases/operator/operator-find-all-points.usecase.js';
import { OperatorFindPointUseCase } from '../usecases/operator/operator-find-point.usecase.js';
import { OperatorUpdatePointUseCase } from '../usecases/operator/operator-update-point.usecase.js';

/**
 * Điểm dừng của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/points.
 *
 * - Luôn làm việc trên nhà xe trong access token (không nhận company_uuid).
 * - Xem được điểm riêng của nhà xe (scope COMPANY) và điểm dùng chung (scope SYSTEM) mà nhà xe
 *   được phép dùng. Điểm dùng chung chỉ xem; sửa/xóa điểm dùng chung hoặc điểm của nhà xe
 *   khác -> 403.
 * - Tạo/sửa ghi created_by/updated_by là username của tài khoản đang đăng nhập.
 * - Dữ liệu trả về là OperatorPoint (xem mappers/operator/operator-point.mapper.ts).
 */
@Controller('operator/points')
export class OperatorPointController {
  constructor(
    private readonly findAllPoints: OperatorFindAllPointsUseCase,
    private readonly findPoint: OperatorFindPointUseCase,
    private readonly createPoint: OperatorCreatePointUseCase,
    private readonly updatePoint: OperatorUpdatePointUseCase,
    private readonly deletePoint: OperatorDeletePointUseCase,
  ) {}

  /**
   * GET /api/operator/points?q=...
   * Điểm dùng chung trước, sau đó điểm của nhà xe, sắp theo tên. `q` tìm theo mã, tên, loại,
   * địa chỉ, ghi chú.
   */
  @Get()
  @RequirePermission('POINT_LIST')
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllPoints.execute(requiredCompanyUuidFromToken(user), query);
  }

  /** GET /api/operator/points/:id */
  @Get(':id')
  @RequirePermission('POINT_LIST')
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.findPoint.execute(requiredCompanyUuidFromToken(user), id);
  }

  /**
   * POST /api/operator/points
   * Vào: OperatorCreatePointDto (bắt buộc point_code, name, point_type).
   * Lỗi: 400 dữ liệu hoặc tỉnh/xã không hợp lệ; 409 mã điểm dừng đã tồn tại trong nhà xe.
   */
  @Post()
  @RequirePermission('POINT_CREATE')
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreatePointDto,
  ) {
    return this.createPoint.execute(
      requiredCompanyUuidFromToken(user),
      dto,
      user.username,
    );
  }

  /** PATCH /api/operator/points/:id - cập nhật một phần điểm của nhà xe. */
  @Patch(':id')
  @RequirePermission('POINT_UPDATE')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdatePointDto,
  ) {
    return this.updatePoint.execute(
      requiredCompanyUuidFromToken(user),
      id,
      dto,
      user.username,
    );
  }

  /** DELETE /api/operator/points/:id - 409 khi điểm đang được dùng trong tuyến hoặc giá vé. */
  @Delete(':id')
  @RequirePermission('POINT_DELETE')
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deletePoint.execute(requiredCompanyUuidFromToken(user), id);
  }
}
