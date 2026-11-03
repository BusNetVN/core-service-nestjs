import { SetMetadata } from '@nestjs/common';
import { SYSTEM_ADMIN_ONLY_KEY } from '../constants/metadata.constant.js';

export { SYSTEM_ADMIN_ONLY_KEY };

export const SystemAdminOnly = () => SetMetadata(SYSTEM_ADMIN_ONLY_KEY, true);
