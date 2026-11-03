import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateVehicleDto } from './create-vehicle.dto.js';

export class UpdateVehicleDto extends PartialType(
  OmitType(CreateVehicleDto, ['company_uuid'] as const),
) {}
