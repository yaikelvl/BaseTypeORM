
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

import { UserRole } from '../enum/roles.enum';

export function Auth(...roles: UserRole[]) {

    return applyDecorators(

        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard),

    );
}