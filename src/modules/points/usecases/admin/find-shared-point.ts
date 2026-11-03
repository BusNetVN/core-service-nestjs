import { ForbiddenException } from '@nestjs/common';
import { PointScope } from '../../enums/point-scope.enum.js';
import { PointRepository } from '../../repository/point.repository.js';

/** Admins may only change shared points; a company's own points are managed by that company. */
export async function findSharedPoint(points: PointRepository, uuid: string) {
  const point = await points.findByUuid(uuid);
  if (point.scope !== PointScope.SYSTEM) {
    throw new ForbiddenException(
      'Điểm dừng riêng của nhà xe do nhà xe tự quản lý, quản trị viên không sửa hoặc xóa được.',
    );
  }
  return point;
}
