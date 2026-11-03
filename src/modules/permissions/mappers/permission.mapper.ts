import { PermissionGroup } from '../entities/permission-group.entity.js';
import { Permission } from '../entities/permission.entity.js';

const NAME_COLLATOR = new Intl.Collator('vi');

export type PublicPermission = {
  id: string;
  code: string;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export type PublicPermissionGroup = PublicPermission & {
  permissions: PublicPermission[];
};

export function normalizeCatalogCode(value: string) {
  return value.trim().toUpperCase();
}

export function toPublicPermission(permission: Permission): PublicPermission {
  return {
    id: permission.uuid,
    code: permission.code,
    name: permission.name,
    description: permission.description,
    sort_order: permission.sort_order,
    is_active: permission.is_active,
    created_by: permission.created_by,
    updated_by: permission.updated_by,
    created_at: permission.created_at,
    updated_at: permission.updated_at,
  };
}

export function toPublicPermissionGroup(
  group: PermissionGroup,
): PublicPermissionGroup {
  return {
    id: group.uuid,
    code: group.code,
    name: group.name,
    description: group.description,
    sort_order: group.sort_order,
    is_active: group.is_active,
    created_by: group.created_by,
    updated_by: group.updated_by,
    permissions: [...(group.permissions ?? [])]
      .sort(
        (left, right) =>
          left.sort_order - right.sort_order ||
          NAME_COLLATOR.compare(left.name, right.name),
      )
      .map(toPublicPermission),
    created_at: group.created_at,
    updated_at: group.updated_at,
  };
}
