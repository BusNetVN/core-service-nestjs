import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto.js';
import {
  normalizeCompanyCode,
  toPublicCompany,
} from '../mappers/company.mapper.js';
import { CompanyRepository } from '../repository/company.repository.js';

@Injectable()
export class CreateCompanyUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  /** `actorUsername` is the username of the user creating the company. */
  async execute(dto: CreateCompanyDto, actorUsername: string) {
    const companyCode = normalizeCompanyCode(dto.company_code);
    await this.companies.assertUnique(companyCode, dto.slug);
    const company = this.companies.create({
      uuid: crypto.randomUUID(),
      name: dto.name,
      short_name: dto.short_name ?? '',
      company_code: companyCode,
      slug: dto.slug,
      logo_url: dto.logo_url ?? '',
      cover_image_url: dto.cover_image_url ?? '',
      description: dto.description ?? '',
      business_type: dto.business_type,
      tax_code: dto.tax_code ?? '',
      business_license_no: dto.business_license_no ?? '',
      legal_representative: dto.legal_representative ?? '',
      representative_phone: dto.representative_phone ?? '',
      email: dto.email ?? '',
      phone: dto.phone ?? '',
      website: dto.website ?? '',
      is_active: dto.is_active ?? true,
      created_by: actorUsername || null,
      updated_by: actorUsername || null,
    });
    return toPublicCompany(await this.companies.save(company));
  }
}
