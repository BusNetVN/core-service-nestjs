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
import { UuidParamPipe } from '../../../common/pipes/uuid-param.pipe.js';
import type { AccessTokenPayload } from '../../../common/types/access-token-payload.js';
import { AdminCreateOfficeDto } from '../dto/admin/admin-create-office.dto.js';
import { AdminUpdateOfficeDto } from '../dto/admin/admin-update-office.dto.js';
import { AdminCreateOfficeUseCase } from '../usecases/admin/admin-create-office.usecase.js';
import { AdminDeleteOfficeUseCase } from '../usecases/admin/admin-delete-office.usecase.js';
import { AdminFindAllOfficesUseCase } from '../usecases/admin/admin-find-all-office.usecase.js';
import { AdminFindOfficeUseCase } from '../usecases/admin/admin-find-office.usecase.js';
import { AdminUpdateOfficeUseCase } from '../usecases/admin/admin-update-office.usecase.js';

/**
 * API quản lý văn phòng cho trang quản trị (bnv-admin), prefix: /api/admin/offices.
 *
 * - Chỉ tài khoản SYSTEM_ADMIN được gọi (@SystemAdminOnly): thiếu/sai token -> 401,
 *   tài khoản khác SYSTEM_ADMIN -> 403.
 * - Khác OperatorOfficeController (/api/operator/offices, dành cho nhân viên nhà xe): không giới hạn
 *   theo nhà xe của người gọi, và danh sách không bắt buộc company_uuid.
 * - Dữ liệu trả về là AdminOffice (xem mappers/admin/admin-office.mapper.ts): `id` là uuid của văn phòng,
 *   kèm company_uuid, thông tin nhà xe (company), created_by/updated_by (username)
 *   và created_at/updated_at.
 */
@Controller('admin/offices')
@SystemAdminOnly()
export class AdminOfficeController {
  constructor(
    private readonly findAllOffices: AdminFindAllOfficesUseCase,
    private readonly findOffice: AdminFindOfficeUseCase,
    private readonly createOffice: AdminCreateOfficeUseCase,
    private readonly updateOffice: AdminUpdateOfficeUseCase,
    private readonly deleteOffice: AdminDeleteOfficeUseCase,
  ) {}

  /**
   * GET /api/admin/offices?company_uuid=...&q=...
   * Lấy danh sách văn phòng, sắp theo tên nhà xe rồi văn phòng mới tạo trước.
   *
   * Vào: `company_uuid` (tùy chọn) - chỉ lấy văn phòng của nhà xe này; bỏ trống thì lấy tất cả.
   *      `q` (tùy chọn) - từ khóa, tìm không phân biệt hoa thường theo mã, tên, địa chỉ,
   *      ghi chú, số điện thoại văn phòng và tên, tên viết tắt, mã của nhà xe.
   * Ra:  AdminOffice[].
   * Lỗi: 400 company_uuid sai định dạng; 404 không tìm thấy nhà xe.
   */
  @Get()
  findAll(
    @Query('company_uuid') companyUuid?: string,
    @Query('q') query?: string,
  ) {
    return this.findAllOffices.execute({ companyUuid, query });
  }

  /**
   * GET /api/admin/offices/:id
   * Xem chi tiết một văn phòng.
   *
   * Vào: `id` - uuid v4 của văn phòng (sai định dạng -> 400 "ID không hợp lệ.").
   * Ra:  AdminOffice; không tồn tại -> 404 "Không tìm thấy văn phòng.".
   */
  @Get(':id')
  findOne(@Param('id', UuidParamPipe) id: string) {
    return this.findOffice.execute(id);
  }

  /**
   * POST /api/admin/offices
   * Tạo văn phòng cho nhà xe bất kỳ; created_by và updated_by ghi là username
   * của tài khoản đang đăng nhập.
   *
   * Vào: body AdminCreateOfficeDto - bắt buộc company_uuid, office_code, name, address và
   *      ít nhất một số điện thoại trong phones; note tùy chọn.
   *      Mã văn phòng được đổi về chữ in hoa, số điện thoại bị trùng được loại bỏ.
   * Ra:  201 + AdminOffice vừa tạo.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy nhà xe;
   *      409 mã văn phòng đã tồn tại trong nhà xe.
   */
  @Post()
  create(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdminCreateOfficeDto,
  ) {
    return this.createOffice.execute(dto, user.username);
  }

  /**
   * PATCH /api/admin/offices/:id
   * Cập nhật một phần thông tin văn phòng: chỉ đổi các trường có gửi lên,
   * và luôn ghi updated_by là username của tài khoản đang đăng nhập.
   * Không đổi được nhà xe của văn phòng.
   *
   * Vào: `id` - uuid v4 của văn phòng; body AdminUpdateOfficeDto (office_code, name, address,
   *      phones, note, đều tùy chọn; gửi company_uuid -> 400).
   * Ra:  AdminOffice sau khi cập nhật.
   * Lỗi: 400 dữ liệu không hợp lệ; 404 không tìm thấy;
   *      409 mã văn phòng đã tồn tại trong nhà xe.
   */
  @Patch(':id')
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param('id', UuidParamPipe) id: string,
    @Body() dto: AdminUpdateOfficeDto,
  ) {
    return this.updateOffice.execute(id, dto, user.username);
  }

  /**
   * DELETE /api/admin/offices/:id
   * Xóa hẳn văn phòng khỏi database. Xe đang gán vào văn phòng này vẫn giữ nguyên,
   * chỉ bị bỏ liên kết văn phòng (office_id = NULL).
   *
   * Vào: `id` - uuid v4 của văn phòng.
   * Ra:  { id, office_code } của văn phòng đã xóa.
   * Lỗi: 404 không tìm thấy.
   */
  @Delete(':id')
  remove(@Param('id', UuidParamPipe) id: string) {
    return this.deleteOffice.execute(id);
  }
}
