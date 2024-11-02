import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ROLES } from '../common/constants';

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const Roles = (...roles: ROLES[]) => SetMetadata(ROLES_KEY, roles);
export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);