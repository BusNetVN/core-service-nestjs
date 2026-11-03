import { BadRequestException, Injectable } from '@nestjs/common';
import { toPublicWard } from '../mappers/location.mapper.js';
import { ProvinceRepository } from '../repository/province.repository.js';
import { WardRepository } from '../repository/ward.repository.js';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class FindAllWardsUseCase {
  constructor(
    private readonly wards: WardRepository,
    private readonly provinces: ProvinceRepository,
  ) {}

  async execute(options: { provinceUuid?: string; query?: string }) {
    let provinceId: string | undefined;
    if (options.provinceUuid) {
      if (!UUID_V4.test(options.provinceUuid)) {
        throw new BadRequestException('Tỉnh/thành phố không hợp lệ.');
      }
      provinceId = (await this.provinces.findByUuid(options.provinceUuid)).id;
    }

    return (
      await this.wards.findVisible({
        provinceId,
        query: options.query,
      })
    ).map(toPublicWard);
  }
}
