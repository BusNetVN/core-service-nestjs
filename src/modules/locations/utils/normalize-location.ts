import {
  ProvinceType,
  WardType,
  type ProvinceTypeValue,
  type WardTypeValue,
} from '../enums/location-type.enum.js';

export type NormalizedProvince = {
  code: string;
  name: string;
  type: ProvinceTypeValue;
  wards: NormalizedWard[];
};

export type NormalizedWard = {
  code: string;
  name: string;
  type: WardTypeValue;
  province_code: string;
};

export type LocationImportPayload = {
  provinces: NormalizedProvince[];
  wards: NormalizedWard[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function padCode(value: unknown, size: number) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(Math.trunc(value)).padStart(size, '0');
  }
  const raw = text(value).replace(/\D/g, '');
  return raw ? raw.padStart(size, '0') : '';
}

function provinceType(value: unknown): ProvinceTypeValue {
  const raw = text(value).toLowerCase();
  if (
    raw.includes('thành phố') ||
    raw.includes('thanh pho') ||
    raw === ProvinceType.THANH_PHO
  ) {
    return ProvinceType.THANH_PHO;
  }
  return ProvinceType.TINH;
}

function wardType(value: unknown): WardTypeValue {
  const raw = text(value).toLowerCase();
  if (raw.includes('đặc khu') || raw.includes('dac khu') || raw === WardType.DAC_KHU) {
    return WardType.DAC_KHU;
  }
  if (raw.includes('phường') || raw.includes('phuong') || raw === WardType.PHUONG) {
    return WardType.PHUONG;
  }
  return WardType.XA;
}

function parseWard(value: unknown, provinceCode: string): NormalizedWard | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  const code = padCode(row.code ?? row.ward_code ?? row.ma, 5);
  const name = text(row.name ?? row.full_name ?? row.ten);
  if (!code || !name) {
    return null;
  }
  return {
    code,
    name,
    type: wardType(row.type ?? row.division_type ?? row.level ?? name),
    province_code: provinceCode,
  };
}

function parseProvince(value: unknown): NormalizedProvince | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  const code = padCode(row.code ?? row.province_code ?? row.ma, 2);
  const name = text(row.name ?? row.full_name ?? row.ten);
  if (!code || !name) {
    return null;
  }

  const nestedWards = Array.isArray(row.wards)
    ? row.wards
    : Array.isArray(row.communes)
      ? row.communes
      : [];

  return {
    code,
    name,
    type: provinceType(row.type ?? row.division_type ?? row.level ?? name),
    wards: nestedWards
      .map((ward) => parseWard(ward, code))
      .filter((ward): ward is NormalizedWard => Boolean(ward)),
  };
}

export function normalizeLocationPayload(raw: unknown): LocationImportPayload {
  const root = asRecord(raw);
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(root?.provinces)
      ? root.provinces
      : [];

  const provinces = list
    .map(parseProvince)
    .filter((province): province is NormalizedProvince => Boolean(province));

  const flatWards = Array.isArray(root?.wards)
    ? root.wards
        .map((ward) => {
          const row = asRecord(ward);
          const provinceCode = padCode(
            row?.province_code ?? row?.parent_code ?? row?.ma_tinh,
            2,
          );
          return parseWard(ward, provinceCode);
        })
        .filter((ward): ward is NormalizedWard => Boolean(ward?.province_code))
    : [];

  const nestedWards = provinces.flatMap((province) => province.wards);
  const wardsByCode = new Map<string, NormalizedWard>();
  for (const ward of [...nestedWards, ...flatWards]) {
    wardsByCode.set(ward.code, ward);
  }

  return {
    provinces: provinces.map((province) => ({
      ...province,
      wards: [],
    })),
    wards: [...wardsByCode.values()],
  };
}
