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
import {
  assertCompanyResource,
  requiredCompanyUuidFromToken,
} from '../../../common/utils/company-scope.js';
import { CreateFareDto } from '../dto/create-fare.dto.js';
import { UpdateFareDto } from '../dto/update-fare.dto.js';
import { CreateFareUseCase } from '../usecases/create-fare.usecase.js';
import { FindAllFaresUseCase } from '../usecases/find-all-fares.usecase.js';
import { FindFareUseCase } from '../usecases/find-fare.usecase.js';
import { RemoveFareUseCase } from '../usecases/remove-fare.usecase.js';
import { UpdateFareUseCase } from '../usecases/update-fare.usecase.js';

@Controller('fares')
export class FaresController {
  constructor(
    private readonly findAllFares: FindAllFaresUseCase,
    private readonly findFare: FindFareUseCase,
    private readonly createFare: CreateFareUseCase,
    private readonly updateFare: UpdateFareUseCase,
    private readonly removeFare: RemoveFareUseCase,
  ) {}

  @Get()
  @RequirePermission(ApiPermission.FARE_LIST)
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('company_uuid') companyUuid?: string,
  ) {
    return this.findAllFares.execute(
      requiredCompanyUuidFromToken(user, companyUuid),
    );
  }

  @Get(':id')
  @RequirePermission(ApiPermission.FARE_LIST)
  async findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const fare = await this.findFare.execute(id);
    assertCompanyResource(user, fare.company_uuid);
    return fare;
  }

  @Post()
  @RequirePermission(ApiPermission.FARE_CREATE)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateFareDto,
  ) {
    dto.company_uuid = requiredCompanyUuidFromToken(user, dto.company_uuid);
    return this.createFare.execute(dto);
  }

  @Patch(':id')
  @RequirePermission(ApiPermission.FARE_UPDATE)
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: UpdateFareDto,
  ) {
    const fare = await this.findFare.execute(id);
    assertCompanyResource(user, fare.company_uuid);
    return this.updateFare.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermission(ApiPermission.FARE_DELETE)
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const fare = await this.findFare.execute(id);
    assertCompanyResource(user, fare.company_uuid);
    return this.removeFare.execute(id);
  }
}
