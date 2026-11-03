import { OmitType } from '@nestjs/mapped-types';
import { AdminCreateRoleDto } from '../admin/admin-create-role.dto.js';
import { AdminUpdateRoleDto } from '../admin/admin-update-role.dto.js';

/** The company always comes from the access token. */
export class OperatorCreateRoleDto extends OmitType(AdminCreateRoleDto, [
  'company_uuid',
] as const) {}

export class OperatorUpdateRoleDto extends AdminUpdateRoleDto {}
