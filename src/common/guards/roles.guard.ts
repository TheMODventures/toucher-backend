import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('role', context.getHandler());
        if (!requiredRoles) {
            return true; // No roles required for this route
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // `user` is set by the JWT strategy

        if (!user) {
            throw new UnauthorizedException('Unauthorized access');
        }

        // Check if user.role matches any of the required roles
        const hasRole = requiredRoles.includes(user.role);
        if (!hasRole) {
            throw new UnauthorizedException('Unauthorized access!');
        }

        return true;
    }
}
