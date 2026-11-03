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
import { ApiPermission } from '../../../common/constants/api-permissions.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { requiredCompanyUuidFromToken } from '../../../common/utils/company-scope.js';
import { OperatorCreateOfficeDto } from '../dto/operator/operator-create-office.dto.js';
import { OperatorUpdateOfficeDto } from '../dto/operator/operator-update-office.dto.js';
import { OperatorCreateOfficeUseCase } from '../usecases/operator/operator-create-office.usecase.js';
import { OperatorDeleteOfficeUseCase } from '../usecases/operator/operator-delete-office.usecase.js';
import { OperatorFindAllOfficesUseCase } from '../usecases/operator/operator-find-all-offices.usecase.js';
import { OperatorFindOfficeUseCase } from '../usecases/operator/operator-find-office.usecase.js';
import { OperatorUpdateOfficeUseCase } from '../usecases/operator/operator-update-office.usecase.js';

/**
 * Văn phòng của nhà xe cho hệ thống vận hành (bnv-operator), prefix: /api/operator/offices.
 *
 * - Luôn làm việc trên nhà xe trong access token (không nhận company_uuid); văn phòng của
 *   nhà xe khác -> 403.
 * - Dữ liệu trả về là OperatorOffice (xem mappers/operator/operator-office.mapper.ts).
 */
@Controller('operator/offices')
export class OperatorOfficeController {
  constructor(
    private readonly findAllOffices: OperatorFindAllOfficesUseCase,
    private readonly findOffice: OperatorFindOfficeUseCase,
    private readonly createOffice: OperatorCreateOfficeUseCase,
    private readonly updateOffice: OperatorUpdateOfficeUseCase,
    private readonly deleteOffice: OperatorDeleteOfficeUseCase,
  ) {}

  /**
   * GET /api/operator/offices?q=...
   * Văn phòng của nhà xe, mới tạo trước. `q` tìm theo mã, tên, địa chỉ, ghi chú, số điện thoại.
   */
  @Get()
  @RequirePermission(ApiPermission.OFFICE_LIST)
  findAll(@CurrentUser() user: AccessTokenPayload, @Query('q') query?: string) {
    return this.findAllOffices.execute(requiredCompanyUuidFromToken(user), query);
  }

  /** GET /api/operator/offices/:id */
  @Get(':id')
  @RequirePermission(ApiPermission.OFFICE_LIST)
  findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.findOffice.execute(requiredCompanyUuidFromToken(user), id);
  }

  /**
   * POST /api/operator/offices
   * Vào: { office_code, name, address, phones (ít nhất 1), note? }.
   * Lỗi: 400 dữ liệu không hợp lệ; 409 mã văn phòng đã tồn tại trong nhà xe.
   */
  @Post()
  @RequirePermission(ApiPermission.OFFICE_CREATE)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: OperatorCreateOfficeDto,
  ) {
    return this.createOffice.execute(
      requiredCompanyUuidFromToken(user),
      dto,
      user.username,
    );
  }

  /** PATCH /api/operator/offices/:id - cập nhật một phần; không đổi được nhà xe. */
  @Patch(':id')
  @RequirePermission(ApiPermission.OFFICE_UPDATE)
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: OperatorUpdateOfficeDto,
  ) {
    return this.updateOffice.execute(
      requiredCompanyUuidFromToken(user),
      id,
      dto,
      user.username,
    );
  }

  /** DELETE /api/operator/offices/:id - xe đang gán văn phòng này được bỏ liên kết. */
  @Delete(':id')
  @RequirePermission(ApiPermission.OFFICE_DELETE)
  remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    return this.deleteOffice.execute(requiredCompanyUuidFromToken(user), id);
  }
}
