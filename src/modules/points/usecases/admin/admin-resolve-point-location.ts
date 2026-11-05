import { BadRequestException } from '@nestjs/common';
import { ProvinceRepository } from '../../../locations/repository/province.repository.js';
import { WardRepository } from '../../../locations/repository/ward.repository.js';

/**
 * Province and ward of a point. With a ward, its province is used; an explicitly
 * given province must then be that same province.
 */
export async function resolveAdminPointLocation(
  provinces: ProvinceRepository,
  wards: WardRepository,
  provinceUuid?: string,
  wardUuid?: string,
) {
  const ward = wardUuid ? await wards.findByUuid(wardUuid) : null;
  const selectedProvince = provinceUuid
    ? await provinces.findByUuid(provinceUuid)
    : null;

  if (ward && selectedProvince && ward.province_id !== selectedProvince.id) {
    throw new BadRequestException('Xã/phường không thuộc tỉnh đã chọn.');
  }

  const province = ward?.province ?? selectedProvince;
  return {
    province,
    ward,
    province_id: province?.id ?? null,
    ward_id: ward?.id ?? null,
  };
}
