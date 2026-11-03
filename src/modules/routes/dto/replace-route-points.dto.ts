import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class RoutePointItemDto {
  @IsUUID('4', { message: 'Điểm dừng không hợp lệ.' })
  point_uuid: string;

  @IsInt({ message: 'Thời gian điểm dừng phải là số phút.' })
  @Min(0, { message: 'Thời gian điểm dừng không được âm.' })
  @Max(10080, { message: 'Thời gian mỗi chặng tối đa 7 ngày.' })
  duration_minutes: number;
}

/** The body field stays `stops` so existing clients keep working. */
export class ReplaceRoutePointsDto {
  @IsArray({ message: 'Danh sách điểm dừng không hợp lệ.' })
  @ArrayMaxSize(100, { message: 'Một tuyến tối đa 100 điểm dừng.' })
  @ValidateNested({ each: true })
  @Type(() => RoutePointItemDto)
  stops: RoutePointItemDto[];
}
