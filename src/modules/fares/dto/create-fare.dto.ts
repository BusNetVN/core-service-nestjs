import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { FareSegmentDto } from './fare-segment.dto.js';

function emptyToUndefined({ value }: { value: unknown }) {
  if (value === '' || value === null) {
    return undefined;
  }
  return value;
}

export class CreateFareDto {
  @IsUUID('4', { message: 'Nhà xe không hợp lệ.' })
  company_uuid: string;

  @IsUUID('4', { message: 'Tuyến đường không hợp lệ.' })
  route_uuid: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4', { message: 'Chuyến áp dụng không hợp lệ.' })
  schedule_uuid?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID('4', { message: 'Sơ đồ ghế không hợp lệ.' })
  seat_map_uuid?: string;

  @IsBoolean({ message: 'Cấu hình ưu tiên không hợp lệ.' })
  priority: boolean;

  @IsDateString({}, { message: 'Ngày bắt đầu không hợp lệ.' })
  start_date: string;

  @IsDateString({}, { message: 'Ngày kết thúc không hợp lệ.' })
  end_date: string;

  @IsArray({ message: 'Các thứ áp dụng không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Chọn ít nhất một thứ trong tuần.' })
  @ArrayUnique({ message: 'Các thứ áp dụng bị trùng.' })
  @IsInt({ each: true, message: 'Thứ trong tuần không hợp lệ.' })
  @Min(1, { each: true, message: 'Thứ trong tuần không hợp lệ.' })
  @Max(7, { each: true, message: 'Thứ trong tuần không hợp lệ.' })
  weekdays: number[];

  @IsArray({ message: 'Bảng giá chặng không hợp lệ.' })
  @ArrayMinSize(1, { message: 'Tuyến cần ít nhất một chặng để cấu hình giá.' })
  @ValidateNested({ each: true })
  @Type(() => FareSegmentDto)
  segments: FareSegmentDto[];
}
