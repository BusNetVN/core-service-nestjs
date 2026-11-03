import { Province } from '../entities/province.entity.js';
import { Ward } from '../entities/ward.entity.js';

export type PublicProvince = {
  id: string;
  code: string;
  name: string;
  type: string;
  status: boolean;
};

export type PublicWard = {
  id: string;
  province_uuid: string | null;
  province_code: string | null;
  code: string;
  name: string;
  type: string;
  status: boolean;
};

export function toPublicProvince(province: Province): PublicProvince {
  return {
    id: province.uuid,
    code: province.code,
    name: province.name,
    type: province.type,
    status: province.status,
  };
}

export function toPublicWard(ward: Ward): PublicWard {
  return {
    id: ward.uuid,
    province_uuid: ward.province?.uuid ?? null,
    province_code: ward.province?.code ?? null,
    code: ward.code,
    name: ward.name,
    type: ward.type,
    status: ward.status,
  };
}
