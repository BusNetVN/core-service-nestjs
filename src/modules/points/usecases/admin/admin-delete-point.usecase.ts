import { ConflictException, Injectable } from '@nestjs/common';
import { isForeignKeyViolation } from '../../../../common/utils/database-error.js';
import { normalizePointCode } from '../../mappers/admin/admin-point.mapper.js';
import { AdminPointRepository } from '../../repository/admin/admin-point.repository.js';
import { findAdminSharedPoint } from './admin-find-shared-point.js';

/**
 * Hard delete of a shared point. Its allowed-company links go with it (ON DELETE CASCADE);
 * route points and fare segments reference it with ON DELETE RESTRICT and block the deletion.
 */
@Injectable()
export class AdminDeletePointUseCase {
  constructor(private readonly points: AdminPointRepository) {}

  async execute(uuid: string) {
    const point = await findAdminSharedPoint(this.points, uuid);
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
