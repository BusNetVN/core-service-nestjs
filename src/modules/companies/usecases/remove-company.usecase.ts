import { ConflictException, Injectable } from '@nestjs/common';
import { isForeignKeyViolation } from '../../../common/utils/database-error.js';
import { normalizeCompanyCode } from '../mappers/company.mapper.js';
import { CompanyRepository } from '../repository/company.repository.js';

@Injectable()
export class RemoveCompanyUseCase {
  constructor(private readonly companies: CompanyRepository) {}

  async execute(uuid: string) {
    const company = await this.companies.findByUuid(uuid);
    if (await this.companies.hasActiveUsers(company.id)) {
      throw new ConflictException(
        'Nhà xe đang có tài khoản trực thuộc, không thể xóa.',
      );
    }

    try {
      await this.companies.remove(company);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Nhà xe đang có dữ liệu liên quan (tài khoản đã xóa, văn phòng, vai trò, điểm đón, tuyến, xe, lịch chạy, giá vé...), không thể xóa.',
        );
      }
      throw error;
    }

    return {
      id: company.uuid,
      company_code: normalizeCompanyCode(company.company_code),
    };
  }
}
