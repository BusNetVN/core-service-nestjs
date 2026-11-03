import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches } from 'class-validator';
import {
  CreateScheduleDto,
  DEPARTURE_TIME_PATTERN,
} from './create-schedule.dto.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

export class UpdateScheduleDto extends PartialType(
  OmitType(CreateScheduleDto, ['company_uuid'] as const),
) {
  @Transform(trim)
  @IsOptional()
  @IsString()
  @Matches(DEPARTURE_TIME_PATTERN, {
    message: 'Giờ khởi hành không hợp lệ.',
  })
  departure_time?: string;
}
