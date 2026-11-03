import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class FareSegmentDto {
  @IsUUID('4', { message: 'Điểm đi không hợp lệ.' })
  origin_point_uuid: string;

  @IsUUID('4', { message: 'Điểm đến không hợp lệ.' })
  destination_point_uuid: string;

  @IsInt({ message: 'Giá vé phải là số nguyên.' })
  @Min(0, { message: 'Giá vé không được âm.' })
  @Max(100_000_000, { message: 'Giá vé vượt mức cho phép.' })
  price: number;
}
