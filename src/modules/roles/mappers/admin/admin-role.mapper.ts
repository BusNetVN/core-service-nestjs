import { Role } from '../../entities/role.entity.js';

export type AdminRolePermission = {
  id: string;
  code: string;
  name: string;
  /** Group of the permission; null when it was not loaded. */
  group: { id: string; code: string; name: string } | null;
};

/** Role as returned by /api/admin/roles. `role.company` must be loaded. */
export type AdminRole = {
  id: string;
  company_uuid: string;
  name: string;
  description: string;
  is_active: boolean;
  permissions: AdminRolePermission[];
  created_by: string | null;
  updated_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export function toAdminRole(role: Role): AdminRole {
  return {
    id: role.uuid,
    company_uuid: role.company.uuid,
    name: role.name,
    description: role.description,
    is_active: role.is_active,
    permissions: [...(role.permissions ?? [])]
      .sort((left, right) => left.code.localeCompare(right.code))
      .map((permission) => ({
        id: permission.uuid,
        code: permission.code,
        name: permission.name,
        group: permission.group
          ? {
              id: permission.group.uuid,
              code: permission.group.code,
              name: permission.group.name,
            }
          : null,
      })),
    created_by: role.created_by,
    updated_by: role.updated_by,
    created_at: role.created_at,
    updated_at: role.updated_at,
  };
}
