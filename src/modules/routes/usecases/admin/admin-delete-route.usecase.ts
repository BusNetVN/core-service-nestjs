import { ConflictException, Injectable } from '@nestjs/common';
import { isForeignKeyViolation } from '../../../../common/utils/database-error.js';
import { normalizeRouteCode } from '../../mappers/route.mapper.js';
import { RouteRepository } from '../../repository/route.repository.js';

/**
 * Hard delete. The route's stops are removed with it (ON DELETE CASCADE);
 * schedules and fares reference it with ON DELETE RESTRICT and block the deletion.
 */
@Injectable()
export class AdminDeleteRouteUseCase {
  constructor(private readonly routes: RouteRepository) {}

  async execute(uuid: string) {
    const route = await this.routes.findByUuid(uuid);
    try {
      await this.routes.remove(route);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Tuyến đang được dùng trong lịch chạy hoặc giá vé, không thể xóa.',
        );
      }
      throw error;
    }

    return {
      id: route.uuid,
      route_code: normalizeRouteCode(route.route_code),
    };
  }
}
