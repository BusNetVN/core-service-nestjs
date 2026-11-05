import {
  toPublicCompany,
  type PublicCompany,
} from '../../../companies/mappers/company.mapper.js';
import { Office } from '../../entities/office.entity.js';

export function normalizeOfficeCode(value: string) {
  return value.trim().toUpperCase();
}

/** Trimmed, non-empty and without duplicates. */
export function normalizePhones(value: unknown) {
  const list = Array.isArray(value) ? value : [];
  return [
    ...new Set(
      list
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean),
    ),
  ];
}

/**
 * Office as returned by /api/operator/offices. `company` is kept because bnv-operator shows
 * it when choosing the working office. `office.company` must be loaded.
 */
export type OperatorOffice = {
  id: string;
  company_uuid: string;
  company: PublicCompany;
  office_code: string;
  name: string;
  address: string;
  phones: string[];
  note: string;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function toOperatorOffice(office: Office): OperatorOffice {
  return {
    id: office.uuid,
    company_uuid: office.company.uuid,
    company: toPublicCompany(office.company),
    office_code: normalizeOfficeCode(office.office_code),
    name: office.name,
    address: office.address,
    phones: office.phones ?? [],
    note: office.note,
    is_active: office.is_active,
    created_by: office.created_by,
    updated_by: office.updated_by,
    created_at: office.created_at,
    updated_at: office.updated_at,
  };
}
