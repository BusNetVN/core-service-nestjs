import { ConflictException, Injectable } from '@nestjs/common';
import { isForeignKeyViolation } from '../../../../common/utils/database-error.js';
import { normalizePointCode } from '../../mappers/operator/operator-point.mapper.js';
import { OperatorPointRepository } from '../../repository/operator/operator-point.repository.js';
import { findCompanyPoint } from './operator-find-company-point.js';

/**
 * Hard delete of a point of the company. Route points and fare segments reference it with
 * ON DELETE RESTRICT and block the deletion (409).
 */
@Injectable()
export class OperatorDeletePointUseCase {
  constructor(private readonly points: OperatorPointRepository) {}

  async execute(companyUuid: string, uuid: string) {
    const point = await findCompanyPoint(this.points, companyUuid, uuid);
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
