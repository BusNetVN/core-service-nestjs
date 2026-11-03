import { BadRequestException } from '@nestjs/common';
import { CompanyRepository } from '../../companies/repository/company.repository.js';
import { Company } from '../../companies/entities/company.entity.js';

export async function resolveAllowedCompanies(
  companies: CompanyRepository,
  uuids: string[] | undefined,
): Promise<Company[] | undefined> {
  if (uuids === undefined) {
    return undefined;
  }

  const unique = [...new Set(uuids)];
  if (unique.length === 0) {
    return [];
  }

  const found = await companies.findByUuids(unique);
  if (found.length !== unique.length) {
    throw new BadRequestException('Có nhà xe không tồn tại.');
  }
  return found;
}
