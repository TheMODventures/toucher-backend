import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorator';
import { ROLES, TokenPayload } from '../common/constants';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private userService: UserService,
        private authService: AuthService,
    ) {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined in environment variables!');
            throw new Error('JWT configuration error');
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        try {
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('No token provided');
            }

            const token = authHeader.split(' ')[1];

            let decoded: TokenPayload;
            try {
                decoded = this.jwtService.verify<TokenPayload>(token, {
                    secret: process.env.JWT_SECRET
                });
            } catch (error) {
                throw new UnauthorizedException('Invalid token');
            }

            // Check for either id or userId in the payload
            const userId = decoded.id || decoded.userId;
            if (!userId) {
                throw new UnauthorizedException('Invalid token payload');
            }

            // Retrieve the user from the database
            const user = await this.userService.findUserById(userId);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            // Verify that the token matches the stored access token
            if (user.accessToken !== token) {
                throw new UnauthorizedException('Token mismatch - invalid session');
            }

            // Check roles if specified
            const requiredRoles = this.reflector.getAllAndOverride<ROLES[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (requiredRoles?.length > 0) {
                const userRole = decoded.role || user.role;
                if (!requiredRoles.includes(userRole as ROLES)) {
                    throw new UnauthorizedException('Insufficient permissions');
                }
            }

            // Attach user to request
            request.user = user;
            return true;
        } catch (error) {
            console.error('Auth guard error:', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }


    private isTokenExpired(exp: number): boolean {
        return Date.now() >= exp * 1000;
    }

    // private async refreshTokens(refreshToken: string) {
    //     try {
    //         return await this.authService.refreshTokens(refreshToken);
    //     } catch {
    //         return null;
    //     }
    // }
}