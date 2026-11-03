export const ErrorMessage = {
  MISSING_ACCESS_TOKEN: 'Thiếu access token.',
  INVALID_ACCESS_TOKEN: 'Access token không hợp lệ hoặc đã hết hạn.',
  INVALID_REFRESH_TOKEN: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
  FORBIDDEN_PERMISSION: 'Bạn không có quyền thực hiện chức năng này.',
  SYSTEM_ADMIN_ONLY: 'Tài khoản không có quyền truy cập chức năng này.',
  GATEWAY_ONLY: 'Chỉ chấp nhận request đi qua gateway.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa.',
  INVALID_UUID: 'ID không hợp lệ.',
  VALIDATION_FAILED: 'Dữ liệu không hợp lệ.',
  DATA_CONFLICT: 'Dữ liệu bị trùng hoặc đang được sử dụng.',
  INTERNAL_ERROR: 'Hệ thống đang gặp sự cố. Vui lòng thử lại.',
} as const;
