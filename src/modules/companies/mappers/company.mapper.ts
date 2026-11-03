import { Company } from '../entities/company.entity.js';

export type PublicCompany = Omit<Company, 'id' | 'uuid'> & {
  id: string;
};

export function normalizeCompanyCode(value: string) {
  return value.trim().toLowerCase();
}

export function toPublicCompany(company: Company): PublicCompany {
  return {
    id: company.uuid,
    name: company.name,
    short_name: company.short_name,
    company_code: normalizeCompanyCode(company.company_code),
    slug: company.slug,
    logo_url: company.logo_url,
    cover_image_url: company.cover_image_url,
    description: company.description,
    business_type: company.business_type,
    tax_code: company.tax_code,
    business_license_no: company.business_license_no,
    legal_representative: company.legal_representative,
    representative_phone: company.representative_phone,
    email: company.email,
    phone: company.phone,
    website: company.website,
    is_active: company.is_active,
    created_by: company.created_by,
    updated_by: company.updated_by,
    created_at: company.created_at,
    updated_at: company.updated_at,
  };
}
