import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePointDto } from './create-point.dto.js';

export class UpdatePointDto extends PartialType(
  OmitType(CreatePointDto, ['company_uuid'] as const),
) {}
