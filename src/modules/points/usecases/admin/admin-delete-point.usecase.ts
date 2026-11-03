import { ConflictException, Injectable } from '@nestjs/common';
import { isForeignKeyViolation } from '../../../../common/utils/database-error.js';
import { normalizePointCode } from '../../mappers/point.mapper.js';
import { PointRepository } from '../../repository/point.repository.js';
import { findSharedPoint } from './find-shared-point.js';

/**
 * Hard delete of a shared point. Its allowed-company links go with it (ON DELETE CASCADE);
 * route points and fare segments reference it with ON DELETE RESTRICT and block the deletion.
 */
@Injectable()
export class AdminDeletePointUseCase {
  constructor(private readonly points: PointRepository) {}

  async execute(uuid: string) {
    const point = await findSharedPoint(this.points, uuid);
    try {
      await this.points.remove(point);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Điểm dừng đang được dùng trong tuyến hoặc giá vé, không thể xóa.',
        );
      }
      throw error;
    }

    return {
      id: point.uuid,
      point_code: normalizePointCode(point.point_code),
    };
  }
}
