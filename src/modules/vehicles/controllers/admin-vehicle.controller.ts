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
import { SystemAdminOnly } from '../../../common/decorators/system-admin-only.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import { AdminCreateVehicleDto } from '../dto/admin/admin-create-vehicle.dto.js';
import { AdminUpdateVehicleDto } from '../dto/admin/admin-update-vehicle.dto.js';
import { AdminCreateVehicleUseCase } from '../usecases/admin/admin-create-vehicle.usecase.js';
import { AdminDeleteVehicleUseCase } from '../usecases/admin/admin-delete-vehicle.usecase.js';
import { AdminFindAllVehiclesUseCase } from '../usecases/admin/admin-find-all-vehicles.usecase.js';
import { AdminFindVehicleUseCase } from '../usecases/admin/admin-find-vehicle.usecase.js';
import { AdminUpdateVehicleUseCase } from '../usecases/admin/admin-update-vehicle.usecase.js';

/**
 * API quản lý phương tiện của mọi nhà xe cho trang quản trị (bnv-admin),
 * prefix: /api/admin/vehicles.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Biển số không trùng trong cùng nhà xe; chi nhánh (office_uuid) phải thuộc nhà xe của xe.
 * - Dữ liệu trả về là AdminVehicle (xem mappers/admin/admin-vehicle.mapper.ts).
 */
@Controller('admin/vehicles')
@SystemAdminOnly()
export class AdminVehicleController {
  constructor(
    private readonly findAllVehicles: AdminFindAllVehiclesUseCase,
    private readonly findVehicle: AdminFindVehicleUseCase,
    private readonly createVehicle: AdminCreateVehicleUseCase,
    private readonly updateVehicle: AdminUpdateVehicleUseCase,
    private readonly deleteVehicle: AdminDeleteVehicleUseCase,
  ) {}

  /**
   * GET /api/admin/vehicles?company_uuid=...&q=...
   * `company_uuid` (tùy chọn) chỉ lấy xe của nhà xe đó; `q` tìm theo biển số, số máy, số khung,
   * nhãn hiệu, tên chủ xe. Sắp theo tên nhà xe rồi xe mới tạo trước.
   */
  @Get()
  findAll(
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllVehicles.execute({ companyUuid, query });
  }

  /** GET /api/admin/vehicles/:id */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findVehicle.execute(id);
  }

  /**
   * POST /api/admin/vehicles
   * Vào: AdminCreateVehicleDto (bắt buộc company_uuid, license_plate).
   * Lỗi: 400 dữ liệu không hợp lệ hoặc chi nhánh không thuộc nhà xe; 404 không tìm thấy nhà xe;
   *      409 biển số đã tồn tại trong nhà xe.
   */
  @Post()
  create(@Body() dto: AdminCreateVehicleDto) {
    return this.createVehicle.execute(dto);
  }

  /** PATCH /api/admin/vehicles/:id - cập nhật một phần; không đổi được nhà xe. */
  @Patch(':id')
  update(
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdateVehicleDto,
  ) {
    return this.updateVehicle.execute(id, dto);
  }

  /** DELETE /api/admin/vehicles/:id */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deleteVehicle.execute(id);
  }
}
