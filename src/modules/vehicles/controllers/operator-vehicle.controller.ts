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
import { OperatorCreateVehicleDto } from '../dto/operator/operator-create-vehicle.dto.js';
import { OperatorUpdateVehicleDto } from '../dto/operator/operator-update-vehicle.dto.js';
import { OperatorCreateVehicleUseCase } from '../usecases/operator/operator-create-vehicle.usecase.js';
import { OperatorDeleteVehicleUseCase } from '../usecases/operator/operator-delete-vehicle.usecase.js';
import { OperatorFindAllVehiclesUseCase } from '../usecases/operator/operator-find-all-vehicles.usecase.js';
import { OperatorFindVehicleUseCase } from '../usecases/operator/operator-find-vehicle.usecase.js';
import { OperatorUpdateVehicleUseCase } from '../usecases/operator/operator-update-vehicle.usecase.js';

/**
 * Phương tiện của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/vehicles.
 *
 * - Luôn làm việc trên nhà xe trong access token (không nhận company_uuid); xe của nhà xe
 *   khác -> 403.
 * - Tạo/sửa ghi created_by/updated_by là username của tài khoản đang đăng nhập.
 * - Dữ liệu trả về là OperatorVehicle (xem mappers/operator/operator-vehicle.mapper.ts).
 */
@Controller('operator/vehicles')
export class OperatorVehicleController {
  constructor(
    private readonly findAllVehicles: OperatorFindAllVehiclesUseCase,
    private readonly findVehicle: OperatorFindVehicleUseCase,
    private readonly createVehicle: OperatorCreateVehicleUseCase,
    private readonly updateVehicle: OperatorUpdateVehicleUseCase,
    private readonly deleteVehicle: OperatorDeleteVehicleUseCase,
  ) {}

  /**
   * GET /api/operator/vehicles?q=...
   * Xe của nhà xe, mới tạo trước. `q` tìm theo biển số, số máy, số khung, nhãn hiệu, tên chủ xe.
   */
  @Get()
  @RequirePermission('VEHICLE_LIST')
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllVehicles.execute(requiredCompanyUuidFromToken(user), query);
  }

  /** GET /api/operator/vehicles/:id */
  @Get(':id')
  @RequirePermission('VEHICLE_LIST')
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.findVehicle.execute(requiredCompanyUuidFromToken(user), id);
  }

  /**
   * POST /api/operator/vehicles
   * Vào: OperatorCreateVehicleDto (bắt buộc license_plate).
   * Lỗi: 400 dữ liệu không hợp lệ hoặc chi nhánh không thuộc nhà xe; 409 biển số đã tồn tại.
   */
  @Post()
  @RequirePermission('VEHICLE_CREATE')
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateVehicleDto,
  ) {
    return this.createVehicle.execute(
      requiredCompanyUuidFromToken(user),
      dto,
      user.username,
    );
  }

  /** PATCH /api/operator/vehicles/:id - cập nhật một phần; không đổi được nhà xe. */
  @Patch(':id')
  @RequirePermission('VEHICLE_UPDATE')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateVehicleDto,
  ) {
    return this.updateVehicle.execute(
      requiredCompanyUuidFromToken(user),
      id,
      dto,
      user.username,
    );
  }

  /** DELETE /api/operator/vehicles/:id */
  @Delete(':id')
  @RequirePermission('VEHICLE_DELETE')
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deleteVehicle.execute(requiredCompanyUuidFromToken(user), id);
  }
}
