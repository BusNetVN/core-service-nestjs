import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { AccountType } from '../../../common/constants/account.constant.js';
import { ApiPermission } from '../../../common/constants/api-permissions.js';
import { ErrorMessage } from '../../../common/constants/error-message.constant.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { RequirePermission } from '../../../common/decorators/require-permission.decorator.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { FindAllProvincesUseCase } from '../usecases/find-all-provinces.usecase.js';
import { FindAllWardsUseCase } from '../usecases/find-all-wards.usecase.js';
import { ImportLocationsUseCase } from '../usecases/import-locations.usecase.js';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly findAllProvinces: FindAllProvincesUseCase,
    private readonly findAllWards: FindAllWardsUseCase,
    private readonly importLocations: ImportLocationsUseCase,
  ) {}

  @Get('provinces')
  @RequirePermission(ApiPermission.LOCATION_LIST)
  listProvinces(@Query('q') query?: string) {
    return this.findAllProvinces.execute(query);
  }

  @Get('wards')
  @RequirePermission(ApiPermission.LOCATION_LIST)
  listWards(
    @Query('province_uuid') provinceUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllWards.execute({ provinceUuid, query });
  }

  @Post('import')
  @RequirePermission(ApiPermission.LOCATION_IMPORT)
  import(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: unknown,
  ) {
    if (user.account_type !== AccountType.SYSTEM_ADMIN) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
    }
    return this.importLocations.execute(body);
  }
}
