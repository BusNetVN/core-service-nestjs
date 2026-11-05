import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function uniqueValues({ value }: { value: unknown }) {
  return Array.isArray(value) ? [...new Set(value)] : value;
}

/**
 * Body of POST /api/operator/roles. The company always comes from the access token
 * (sending company_uuid -> 400).
 */
export class OperatorCreateRoleDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập tên vai trò.' })
  @MaxLength(120)
  name: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Trạng thái không hợp lệ.' })
  is_active?: boolean;

  /** uuid of the permissions (tbl_permissions) granted to the role. */
  @Transform(uniqueValues)
  @IsOptional()
  @IsArray({ message: 'Danh sách chức năng không hợp lệ.' })
  @IsUUID('4', { each: true, message: 'Chức năng không hợp lệ.' })
  permission_ids?: string[];
}
