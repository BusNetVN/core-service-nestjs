import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AccountType } from '../../../common/constants/account.constant.js';
import { ApiPermission } from '../../../common/constants/api-permissions.js';
import { ErrorMessage } from '../../../common/constants/error-message.constant.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import {
  assertCompanyResource,
  companyUuidFromToken,
  requiredCompanyUuidFromToken,
} from '../../../common/utils/company-scope.js';
import { CreatePointDto } from '../dto/create-point.dto.js';
import { UpdatePointDto } from '../dto/update-point.dto.js';
import type { PublicPoint } from '../mappers/point.mapper.js';
import { CreatePointUseCase } from '../usecases/create-point.usecase.js';
import { FindAllPointsUseCase } from '../usecases/find-all-points.usecase.js';
import { FindPointUseCase } from '../usecases/find-point.usecase.js';
import { RemovePointUseCase } from '../usecases/remove-point.usecase.js';
import { UpdatePointUseCase } from '../usecases/update-point.usecase.js';

@Controller('points')
export class PointsController {
  constructor(
    private readonly findAllPoints: FindAllPointsUseCase,
    private readonly findPoint: FindPointUseCase,
    private readonly createPoint: CreatePointUseCase,
    private readonly updatePoint: UpdatePointUseCase,
    private readonly removePoint: RemovePointUseCase,
  ) {}

  @Get()
  @RequirePermission(ApiPermission.POINT_LIST)
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('company_uuid') companyUuid?: string,
    @Query('scope') scope?: string,
    @Query('q') query?: string,
  ) {
    const sharedOnly = scope === 'shared';
    const scopedCompany = sharedOnly
      ? undefined
      : companyUuidFromToken(user, companyUuid);

    if (
      user.account_type !== AccountType.SYSTEM_ADMIN &&
      !scopedCompany &&
      !sharedOnly
    ) {
      return this.findAllPoints.execute({
        companyUuid: requiredCompanyUuidFromToken(user, companyUuid),
        query,
      });
    }

    return this.findAllPoints.execute({
      companyUuid: scopedCompany,
      sharedOnly:
        sharedOnly || user.account_type === AccountType.SYSTEM_ADMIN,
      query,
    });
  }

  @Get(':id')
  @RequirePermission(ApiPermission.POINT_LIST)
  async findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const point = await this.findPoint.execute(id);
    this.assertVisible(user, point);
    return point;
  }

  @Post()
  @RequirePermission(ApiPermission.POINT_CREATE)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreatePointDto,
  ) {
    if (user.account_type === AccountType.SYSTEM_ADMIN) {
      dto.company_uuid = undefined;
    } else {
      dto.company_uuid = requiredCompanyUuidFromToken(user, dto.company_uuid);
    }
    return this.createPoint.execute(dto, user.username);
  }

  @Patch(':id')
  @RequirePermission(ApiPermission.POINT_UPDATE)
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: UpdatePointDto,
  ) {
    const point = await this.findPoint.execute(id);
    this.assertMutable(user, point);
    return this.updatePoint.execute(id, dto, user.username);
  }

  @Delete(':id')
  @RequirePermission(ApiPermission.POINT_DELETE)
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const point = await this.findPoint.execute(id);
    this.assertMutable(user, point);
    return this.removePoint.execute(id);
  }

  private assertVisible(user: AccessTokenPayload, point: PublicPoint) {
    if (user.account_type === AccountType.SYSTEM_ADMIN || point.shared) {
      return;
    }
    assertCompanyResource(user, point.company_uuid);
  }

  private assertMutable(user: AccessTokenPayload, point: PublicPoint) {
    if (user.account_type === AccountType.SYSTEM_ADMIN) {
      if (!point.shared) {
        throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
      }
      return;
    }
    if (point.shared) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
    }
    assertCompanyResource(user, point.company_uuid);
  }
}
