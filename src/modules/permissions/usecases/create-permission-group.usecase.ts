import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePermissionGroupDto } from '../dto/create-permission-group.dto.js';
import {
  normalizeCatalogCode,
  toPublicPermissionGroup,
} from '../mappers/permission.mapper.js';
import { PermissionGroupRepository } from '../repository/permission-group.repository.js';
import { PermissionRepository } from '../repository/permission.repository.js';

export const PERMISSION_CODE_MAX_LENGTH = 64;

const STANDARD_PERMISSIONS = [
  { action: 'CREATE', name: 'Tạo' },
  { action: 'UPDATE', name: 'Cập nhật' },
  { action: 'DELETE', name: 'Xóa' },
  { action: 'LIST', name: 'Lấy danh sách' },
] as const;

@Injectable()
export class CreatePermissionGroupUseCase {
  constructor(
    private readonly groups: PermissionGroupRepository,
    private readonly permissions: PermissionRepository,
  ) {}

  /** `actorUsername` is recorded as creator of the group and of its standard permissions. */
  async execute(dto: CreatePermissionGroupDto, actorUsername: string) {
    const code = normalizeCatalogCode(dto.code);
    await this.groups.assertCodeAvailable(code);

    const now = new Date();
    const actor = actorUsername || null;
    const standardPermissions =
      dto.seed_standard_permissions === false
        ? []
        : await this.standardPermissions(code, now, actor);

    const group = await this.groups.createWithPermissions(
      {
        uuid: crypto.randomUUID(),
        code,
        name: dto.name,
        description: dto.description ?? '',
        sort_order: dto.sort_order ?? (await this.groups.nextSortOrder()),
        is_active: dto.is_active ?? true,
        created_by: actor,
        updated_by: actor,
        created_at: now,
        updated_at: now,
      },
      standardPermissions,
    );
    return toPublicPermissionGroup(group);
  }

  private async standardPermissions(
    groupCode: string,
    now: Date,
    actor: string | null,
  ) {
    const codes = STANDARD_PERMISSIONS.map(
      (item) => `${groupCode}_${item.action}`,
    );
    if (codes.some((code) => code.length > PERMISSION_CODE_MAX_LENGTH)) {
      throw new BadRequestException(
        `Mã nhóm quá dài để tạo các chức năng chuẩn (tối đa ${PERMISSION_CODE_MAX_LENGTH} ký tự cho mã chức năng).`,
      );
    }

    const [existed] = await this.permissions.findExistingCodes(codes);
    if (existed) {
      throw new ConflictException(`Mã chức năng ${existed} đã tồn tại.`);
    }

    return STANDARD_PERMISSIONS.map((item, index) => ({
      uuid: crypto.randomUUID(),
      code: codes[index],
      name: item.name,
      description: '',
      sort_order: index + 1,
      is_active: true,
      created_by: actor,
      updated_by: actor,
      created_at: now,
      updated_at: now,
    }));
  }
}
