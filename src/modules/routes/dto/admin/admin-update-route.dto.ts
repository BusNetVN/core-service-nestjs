import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AdminCreateRouteDto } from './admin-create-route.dto.js';

/**
 * Partial update; the company cannot change because the route's stops,
 * schedules and fares belong to that company.
 */
export class AdminUpdateRouteDto extends PartialType(
  OmitType(AdminCreateRouteDto, ['company_uuid'] as const),
) {}
