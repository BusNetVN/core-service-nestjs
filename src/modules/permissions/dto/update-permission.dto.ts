import { PartialType } from '@nestjs/mapped-types';
import { CreatePermissionDto } from './create-permission.dto.js';

/** Partial update: missing fields keep their current value. */
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
