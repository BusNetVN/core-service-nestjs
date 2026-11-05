import { ForbiddenException } from '@nestjs/common';
import { ErrorMessage } from '../../../../common/constants/error-message.constant.js';
import { PointScope } from '../../enums/point-scope.enum.js';
import { OperatorPointRepository } from '../../repository/operator/operator-point.repository.js';

/** The point `uuid` when the company may see it: its own point or a shared one; else 403. */
export async function findVisiblePoint(
  points: OperatorPointRepository,
  companyUuid: string,
  uuid: string,
) {
  const point = await points.findByUuid(uuid);
  if (point.scope !== PointScope.SYSTEM && point.company?.uuid !== companyUuid) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return point;
}

/**
 * The point `uuid` when it belongs to `companyUuid`; shared points are read only for a
 * company and points of another company are hidden (both 403).
 */
export async function findCompanyPoint(
  points: OperatorPointRepository,
  companyUuid: string,
  uuid: string,
) {
  const point = await points.findByUuid(uuid);
  if (point.scope === PointScope.SYSTEM) {
    throw new ForbiddenException(
      'Điểm dừng dùng chung do hệ thống quản lý, nhà xe chỉ được xem.',
    );
  }
  const { company } = point;
  if (!company || company.uuid !== companyUuid) {
    throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
  }
  return Object.assign(point, { company });
}
