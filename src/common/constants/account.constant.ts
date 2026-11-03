export const AccountType = {
  CUSTOMER: 'CUSTOMER',
  COMPANY_STAFF: 'COMPANY_STAFF',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  AGENCY: 'AGENCY',
} as const;

export type AccountTypeValue = (typeof AccountType)[keyof typeof AccountType];

export const ACCOUNT_TYPE_VALUES = Object.values(AccountType);

export const StaffRole = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  DRIVER: 'DRIVER',
  ASSISTANT: 'ASSISTANT',
} as const;

export type StaffRoleValue = (typeof StaffRole)[keyof typeof StaffRole];

export const STAFF_ROLE_VALUES = Object.values(StaffRole);
