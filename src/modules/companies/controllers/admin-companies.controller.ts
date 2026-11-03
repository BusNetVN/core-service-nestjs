import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { SystemAdminOnly } from '../../../common/decorators/system-admin-only.decorator.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import { CreateCompanyDto } from '../dto/create-company.dto.js';
import { UpdateCompanyDto } from '../dto/update-company.dto.js';
import { CreateCompanyUseCase } from '../usecases/create-company.usecase.js';
import { FindAllCompaniesUseCase } from '../usecases/find-all-companies.usecase.js';
import { FindCompanyUseCase } from '../usecases/find-company.usecase.js';
import { RemoveCompanyUseCase } from '../usecases/remove-company.usecase.js';
import { UpdateCompanyUseCase } from '../usecases/update-company.usecase.js';

/**
 * API quản lý nhà xe cho trang quản trị (bnv-admin), prefix: /api/admin/companies.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Dùng chung use case với CompaniesController (/api/companies); khác ở chỗ
 *   controller đó kiểm tra theo mã quyền COMPANY.*.
 * - Dữ liệu trả về là PublicCompany (xem company.mapper.ts): `id` là uuid của nhà xe,
 *   kèm is_active, created_by/updated_by (username), created_at/updated_at.
 */
@Controller('admin/companies')
@SystemAdminOnly()
export class AdminCompaniesController {
  constructor(
    private readonly findAllCompanies: FindAllCompaniesUseCase,
    private readonly findCompany: FindCompanyUseCase,
    private readonly createCompany: CreateCompanyUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
    private readonly removeCompany: RemoveCompanyUseCase,
  ) {}

  /**
   * GET /api/admin/companies?q=...
   * Lấy danh sách nhà xe, mới tạo xếp trước.
   *
   * Vào: `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo tên, tên viết tắt,
   *      mã công ty, slug, điện thoại, email, mã số thuế.
   * Ra:  PublicCompany[] (mảng rỗng nếu không có kết quả).
   */
  @Get()
  findAll(@Query('q') query?: string) {
    return this.findAllCompanies.execute(query);
  }

  /**
   * GET /api/admin/companies/:id
   * Xem chi tiết một nhà xe.
   *
   * Vào: `id` - uuid v4 của nhà xe (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  PublicCompany; không tồn tại -> 404 "Không tìm thấy nhà xe.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findCompany.execute(id);
  }

  /**
   * POST /api/admin/companies
   * Tạo nhà xe mới; người tạo và người cập nhật đều ghi là username của tài khoản đang đăng nhập.
   *
   * Vào: body CreateCompanyDto - bắt buộc name, company_code, slug, business_type
   *      (TNHH | CP | HTX | HKG); các trường khác tùy chọn, is_active mặc định true.
   *      Không được gửi created_by/updated_by (-> 400).
   * Ra:  201 + PublicCompany vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ; 409 trùng mã công ty hoặc slug.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: CreateCompanyDto,
  ) {
    return this.createCompany.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/companies/:id
   * Cập nhật một phần thông tin nhà xe: chỉ đổi các trường có gửi lên,
   * và luôn ghi updated_by là username của tài khoản đang đăng nhập.
   *
   * Vào: `id` - uuid v4 của nhà xe; body UpdateCompanyDto (mọi trường của
   *      CreateCompanyDto đều tùy chọn).
   * Ra:  PublicCompany sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy; 409 trùng mã công ty hoặc slug.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.updateCompany.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/companies/:id
   * Xóa hẳn nhà xe khỏi database (không phải xóa mềm).
   *
   * Vào: `id` - uuid v4 của nhà xe.
   * Ra:  { id, company_code } của nhà xe đã xóa.
   * Lỗi: 404 không tìm thấy; 409 nếu nhà xe còn tài khoản trực thuộc hoặc còn
   *      dữ liệu liên quan (văn phòng, điểm dừng, tuyến, xe, lịch chạy, giá vé...).
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.removeCompany.execute(id);
  }
}
