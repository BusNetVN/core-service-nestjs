import { OmitType } from '@nestjs/mapped-types';
import { AdminCreateUserDto } from '../admin/admin-create-user.dto.js';
import { AdminUpdateUserDto } from '../admin/admin-update-user.dto.js';

/** Staff are always COMPANY_STAFF of the company in the access token. */
export class OperatorCreateStaffDto extends OmitType(AdminCreateUserDto, [
  'account_type',
  'company_uuid',
] as const) {}

export class OperatorUpdateStaffDto extends OmitType(AdminUpdateUserDto, [
  'account_type',
  'company_uuid',
] as const) {}
