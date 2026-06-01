import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@audit/database';

export const ROLES_KEY = 'roles';

/** Тухайн endpoint-д хандах боломжтой роль(ууд)-ыг зааж өгнө. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
