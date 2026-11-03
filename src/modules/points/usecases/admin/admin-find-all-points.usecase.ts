import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../../companies/repository/company.repository.js';
import { PointScope, type PointScopeValue } from '../../enums/point-scope.enum.js';
import { toPublicPoint } from '../../mappers/point.mapper.js';
import { PointRepository } from '../../repository/point.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Query values of `scope`, as already used by bnv-admin (`?scope=shared`). */
const SCOPE_BY_QUERY: Record<string, PointScopeValue> = {
  shared: PointScope.SYSTEM,
  company: PointScope.COMPANY,
};

@Injectable()
export class AdminFindAllPointsUseCase {
  constructor(
    private readonly points: PointRepository,
    private readonly companies: CompanyRepository,
  ) {}

  async execute(options: { scope?: string; companyUuid?: string; query?: string }) {
    const scope = options.scope ? SCOPE_BY_QUERY[options.scope] : undefined;
    if (options.scope && !scope) {
      throw new BadRequestException('Phạm vi điểm dừng không hợp lệ (shared hoặc company).');
    }

    let companyId: string | undefined;
    if (options.companyUuid) {
      if (!UUID_V4.test(options.companyUuid)) {
        throw new BadRequestException('Nhà xe không hợp lệ.');
      }
      if (scope === PointScope.SYSTEM) {
        throw new BadRequestException('Điểm dừng dùng chung không thuộc nhà xe nào.');
      }
      companyId = (await this.companies.findByUuid(options.companyUuid)).id;
    }

    const points = await this.points.findAllForAdmin({
      scope: companyId ? PointScope.COMPANY : scope,
      companyId,
      query: options.query,
    });
    return points.map(toPublicPoint);
  }
}
