import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AdminCreateRoleDto } from './admin-create-role.dto.js';

export class AdminUpdateRoleDto extends PartialType(
  OmitType(AdminCreateRoleDto, ['company_uuid'] as const),
) {}
