import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePermissionGroupDto } from './create-permission-group.dto.js';

/** Partial update: missing fields keep their current value. */
export class UpdatePermissionGroupDto extends PartialType(
  OmitType(CreatePermissionGroupDto, ['seed_standard_permissions'] as const),
) {}
