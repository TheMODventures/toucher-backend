import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { JwtPayload } from '../interfaces';

export const GetCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    return user.id;
});

export const GetCurrentUser = createParamDecorator((_: undefined, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest();
    return request.user;
});


export const Roles = (...roles: string[]) => SetMetadata('role', roles);
