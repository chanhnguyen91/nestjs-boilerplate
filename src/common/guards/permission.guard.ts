import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/permission.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { I18nService } from '../services/i18n.service';
import { Request } from 'express';
import { JwtPayload } from '../../domains/auth/strategies/jwt.strategy';
import { PERMISSION_NAME } from '../constants/permission.constant';
import { UnauthorizedError, AccessDeniedError } from '../exceptions';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private i18nService: I18nService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<{
      name: (typeof PERMISSION_NAME)[keyof typeof PERMISSION_NAME];
      canRead?: boolean;
      canWrite?: boolean;
      canDelete?: boolean;
    }>(PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredPermissions || (!requiredPermissions.canRead && !requiredPermissions.canWrite && !requiredPermissions.canDelete)) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as Request;
    const user = request.user as JwtPayload | undefined;

    if (!user || !user.roles) {
      throw new UnauthorizedError({
        statusCode: 401,
        message: 'errors.unauthorized',
      });
    }

    const roles = user.roles;
    if (!roles || !Array.isArray(roles)) {
      throw new UnauthorizedError({
        statusCode: 401,
        message: 'errors.unauthorized',
      });
    }

    const rolePermissions = await Promise.all(
      roles.map(async (role: any) => {
        const loadedRole = await role;
        return (await loadedRole.rolePermissions) || [];
      })
    ).then(perms => perms.flat());

    const hasPermission = rolePermissions.some((rp: any) => {
      const permissionMatch = rp.permission.name === requiredPermissions.name;
      if (requiredPermissions.canRead && !rp.can_read) return false;
      if (requiredPermissions.canWrite && !rp.can_write) return false;
      if (requiredPermissions.canDelete && !rp.can_delete) return false;
      return permissionMatch;
    });

    if (!hasPermission) {
      throw new AccessDeniedError({
        statusCode: 403,
        message: 'errors.forbidden',
      });
    }

    return true;
  }
}