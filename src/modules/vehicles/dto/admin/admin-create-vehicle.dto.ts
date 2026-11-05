import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { VehicleCondition, VehicleStatus } from '../../enums/vehicle.enum.js';

function trim({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value;
}

function trimUpper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

function toNumber({ value }: { value: unknown }) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const next = Number(value);
  return Number.isFinite(next) ? next : value;
}

// '' clears a nullable field.
function emptyToNull({ value }: { value: unknown }) {
  return value === '' ? null : value;
}

function toNullableNumber({ value }: { value: unknown }) {
  if (value === '' || value === null) {
    return null;
  }
  const next = Number(value);
  return Number.isFinite(next) ? next : value;
}

/** Body of POST /api/admin/vehicles: a vehicle of the company named by `company_uuid`. */
export class AdminCreateVehicleDto {
  @IsUUID('4', { message: 'Nhà xe không hợp lệ.' })
  company_uuid: string;

  @Transform(trimUpper)
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập biển số xe.' })
  @MaxLength(32)
  license_plate: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  engine_number?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  chassis_number?: string;

  @Transform(toNumber)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(200)
  seat_count?: number;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  model_code?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  vehicle_kind?: string;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string;

  @Transform(toNumber)
  @IsOptional()
  @IsNumber()
  @Min(0)
  payload?: number;

  @Transform(toNumber)
  @IsOptional()
  @IsNumber()
  @Min(0)
  initial_odometer?: number;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  brand?: string;

  @Transform(toNullableNumber)
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  manufacture_year?: number | null;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  manufacture_country?: string;

  @Transform(toNullableNumber)
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2200)
  service_life_year?: number | null;

  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(180)
  owner_name?: string;

  @Transform(emptyToNull)
  @IsOptional()
  @IsDateString()
  registration_date?: string | null;

  /** Office (chi nhánh) of the same company managing the vehicle; null for none. */
  @Transform(emptyToNull)
  @IsOptional()
  @IsUUID('4')
  office_uuid?: string | null;

  @IsOptional()
  @IsEnum(VehicleCondition)
  condition?: VehicleCondition;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}
