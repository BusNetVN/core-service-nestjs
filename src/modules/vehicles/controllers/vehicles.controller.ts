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
  companyUuidFromToken,
  requiredCompanyUuidFromToken,
} from '../../../common/utils/company-scope.js';
import { CreateVehicleDto } from '../dto/create-vehicle.dto.js';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto.js';
import { CreateVehicleUseCase } from '../usecases/create-vehicle.usecase.js';
import { FindAllVehiclesUseCase } from '../usecases/find-all-vehicles.usecase.js';
import { FindVehicleUseCase } from '../usecases/find-vehicle.usecase.js';
import { RemoveVehicleUseCase } from '../usecases/remove-vehicle.usecase.js';
import { UpdateVehicleUseCase } from '../usecases/update-vehicle.usecase.js';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly findAllVehicles: FindAllVehiclesUseCase,
    private readonly findVehicle: FindVehicleUseCase,
    private readonly createVehicle: CreateVehicleUseCase,
    private readonly updateVehicle: UpdateVehicleUseCase,
    private readonly removeVehicle: RemoveVehicleUseCase,
  ) {}

  @Get()
  @RequirePermission(ApiPermission.VEHICLE_LIST)
  findAll(
    @CurrentUser() user: AccessTokenPayload,
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllVehicles.execute(
      companyUuidFromToken(user, companyUuid),
      query,
    );
  }

  @Get(':id')
  @RequirePermission(ApiPermission.VEHICLE_LIST)
  async findOne(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const vehicle = await this.findVehicle.execute(id);
    assertCompanyResource(user, vehicle.company_uuid);
    return vehicle;
  }

  @Post()
  @RequirePermission(ApiPermission.VEHICLE_CREATE)
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateVehicleDto,
  ) {
    dto.company_uuid = requiredCompanyUuidFromToken(user, dto.company_uuid);
    return this.createVehicle.execute(dto);
  }

  @Patch(':id')
  @RequirePermission(ApiPermission.VEHICLE_UPDATE)
  async update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    const vehicle = await this.findVehicle.execute(id);
    assertCompanyResource(user, vehicle.company_uuid);
    return this.updateVehicle.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermission(ApiPermission.VEHICLE_DELETE)
  async remove(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
  ) {
    const vehicle = await this.findVehicle.execute(id);
    assertCompanyResource(user, vehicle.company_uuid);
    return this.removeVehicle.execute(id);
  }
}
