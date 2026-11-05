import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AdminUpdatePermissionGroupDto } from '../../dto/admin/admin-update-permission-group.dto.js';
import { PermissionGroup } from '../../entities/permission-group.entity.js';
import {
  normalizeCatalogCode,
  toAdminPermissionGroup,
} from '../../mappers/admin/admin-permission.mapper.js';
import { AdminPermissionGroupRepository } from '../../repository/admin/admin-permission-group.repository.js';
import { AdminPermissionRepository } from '../../repository/admin/admin-permission.repository.js';
import { PERMISSION_CODE_MAX_LENGTH } from './admin-create-permission-group.usecase.js';

function rewritePrefix(code: string, currentGroupCode: string, nextGroupCode: string) {
  if (code === currentGroupCode || code === nextGroupCode) {
    return nextGroupCode;
  }
  if (code.startsWith(`${currentGroupCode}_`)) {
    return nextGroupCode + code.slice(currentGroupCode.length);
  }
  if (code.startsWith(`${nextGroupCode}_`)) {
    return code;
  }

  // Group codes may contain '_' themselves, so the action is whatever follows the last one.
  const suffix = code.slice(code.lastIndexOf('_') + 1);
  return suffix ? `${nextGroupCode}_${suffix}` : nextGroupCode;
}

@Injectable()
export class AdminUpdatePermissionGroupUseCase {
  constructor(
    private readonly groups: AdminPermissionGroupRepository,
    private readonly permissions: AdminPermissionRepository,
  ) {}

  /** `actorUsername` is recorded as updater of the group and of permissions whose code it rewrites. */
  async execute(
    uuid: string,
    dto: AdminUpdatePermissionGroupDto,
    actorUsername: string,
  ) {
    const group = await this.groups.findByUuid(uuid);
    const now = new Date();
    const actor = actorUsername || null;

    const code = dto.code === undefined ? undefined : normalizeCatalogCode(dto.code);
    let renamedCodes: Array<{ id: string; code: string }> = [];
    if (code !== undefined && code !== group.code) {
      await this.groups.assertCodeAvailable(code, group.id);
      renamedCodes = await this.renamePermissionCodes(group, code);
    }

    const updated = await this.groups.update(
      group,
      {
        ...(code !== undefined ? { code } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
        ...(dto.is_active !== undefined ? { is_active: dto.is_active } : {}),
        updated_by: actor,
        updated_at: now,
      },
      renamedCodes,
      now,
      actor,
    );
    return toAdminPermissionGroup(updated);
  }

  private async renamePermissionCodes(group: PermissionGroup, nextGroupCode: string) {
    const permissions = group.permissions ?? [];
    const nextCodes = permissions.map((permission) =>
      rewritePrefix(permission.code, group.code, nextGroupCode),
    );

    const tooLong = permissions.find(
      (_, index) => nextCodes[index].length > PERMISSION_CODE_MAX_LENGTH,
    );
    if (tooLong) {
      throw new BadRequestException(
        `Mã chức năng ${tooLong.code} vượt quá ${PERMISSION_CODE_MAX_LENGTH} ký tự sau khi đổi mã nhóm.`,
      );
    }

    const duplicated = nextCodes.find(
      (code, index) => nextCodes.indexOf(code) !== index,
    );
    if (duplicated) {
      throw new ConflictException(`Đổi mã nhóm làm trùng mã chức năng ${duplicated}.`);
    }

    const [taken] = await this.permissions.findExistingCodes(nextCodes, group.id);
    if (taken) {
      throw new ConflictException(`Mã chức năng ${taken} đã tồn tại.`);
    }

    return permissions
      .map((permission, index) => ({ id: permission.id, code: nextCodes[index] }))
      .filter((item, index) => item.code !== permissions[index].code);
  }
}
