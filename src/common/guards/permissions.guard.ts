import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AccountType } from '../constants/account.constant.js';
import { ErrorMessage } from '../constants/error-message.constant.js';
import {
  IS_PUBLIC_KEY,
  REQUIRED_PERMISSIONS_KEY,
  SYSTEM_ADMIN_ONLY_KEY,
} from '../constants/metadata.constant.js';
import type { AccessTokenPayload } from '../types/access-token-payload.js';
import { grantedPermissionCodes } from '../utils/permission-code.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets);
    if (isPublic) {
      return true;
    }

    const systemAdminOnly = this.reflector.getAllAndOverride<boolean>(
      SYSTEM_ADMIN_ONLY_KEY,
      targets,
    );
    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      targets,
    );
    if (!systemAdminOnly && !required?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<
      Request & { user?: AccessTokenPayload }
    >();
    const user = request.user;
    if (!user?.sub) {
      throw new UnauthorizedException(ErrorMessage.MISSING_ACCESS_TOKEN);
    }

    if (user.account_type === AccountType.SYSTEM_ADMIN) {
      return true;
    }

    if (systemAdminOnly) {
      throw new ForbiddenException(ErrorMessage.SYSTEM_ADMIN_ONLY);
    }

    const granted = grantedPermissionCodes({
      account_type: user.account_type,
      staff_role: user.staff_role,
      permissions: user.permissions ?? [],
    });
    const allowed = required.some((code) => granted.has(code));
    if (!allowed) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN_PERMISSION);
    }

    return true;
  }
}
