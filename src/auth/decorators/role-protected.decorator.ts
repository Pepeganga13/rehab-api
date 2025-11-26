import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../roles/user-role.enum';

export const META_ROLES = 'roles';

export const RoleProtected = (...roles: UserRole[]) => {
  return SetMetadata(META_ROLES, roles);
};