import { IsUUID } from 'class-validator';
import { OfficeFieldsDto } from '../office-fields.dto.js';

/** The admin chooses the company of the office. */
export class AdminCreateOfficeDto extends OfficeFieldsDto {
  @IsUUID('4', { message: 'Nhà xe không hợp lệ.' })
  company_uuid: string;
}
