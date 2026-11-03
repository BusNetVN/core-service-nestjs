import { OmitType } from '@nestjs/mapped-types';
import { CreateFareDto } from './create-fare.dto.js';

export class UpdateFareDto extends OmitType(CreateFareDto, [
  'company_uuid',
] as const) {}
