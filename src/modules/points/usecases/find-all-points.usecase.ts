import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { toPublicPoint } from '../mappers/point.mapper.js';
import { PointRepository } from '../repository/point.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class FindAllPointsUseCase {
  constructor(
    private readonly points: PointRepository,
    private readonly companies: CompanyRepository,
  ) {}

  async execute(options: {
    companyUuid?: string;
    sharedOnly?: boolean;
    query?: string;
  }) {
    let companyId: string | null | undefined;
    if (options.companyUuid) {
      if (!UUID_V4.test(options.companyUuid)) {
        throw new BadRequestException('Nhà xe không hợp lệ.');
      }
      const company = await this.companies.findByUuid(options.companyUuid);
      companyId = company.id;
    }

    const points = await this.points.findVisible({
      companyId,
      sharedOnly: options.sharedOnly && !companyId,
      query: options.query,
    });
    return points.map(toPublicPoint);
  }
}
