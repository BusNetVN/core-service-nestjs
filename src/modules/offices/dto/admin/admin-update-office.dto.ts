import { PartialType } from '@nestjs/mapped-types';
import { OfficeFieldsDto } from '../office-fields.dto.js';

/** The company of an office cannot be changed (sending company_uuid -> 400). */
export class AdminUpdateOfficeDto extends PartialType(OfficeFieldsDto) {}
