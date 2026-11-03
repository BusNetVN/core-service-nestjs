import { PartialType } from '@nestjs/mapped-types';
import { AdminCreatePointDto } from './admin-create-point.dto.js';

/** Partial update of a shared point; missing fields keep their current value. */
export class AdminUpdatePointDto extends PartialType(AdminCreatePointDto) {}
