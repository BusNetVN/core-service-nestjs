import { PartialType } from '@nestjs/mapped-types';
import { OfficeFieldsDto } from '../office-fields.dto.js';

export class OperatorUpdateOfficeDto extends PartialType(OfficeFieldsDto) {}
