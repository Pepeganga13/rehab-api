import { CanActivate, ExecutionContext, Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from '../roles/user-role.enum';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    // 1. Obtener los roles requeridos de la metadata de la ruta
    const requiredRoles = this.reflector.get<UserRole[]>(
      META_ROLES,
      context.getHandler(),
    );
    
    // Si no se requiere ningún rol (la ruta es pública), permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // 2. Obtener el usuario de la petición (debe ser añadido por el JwtAuthGuard previo)
    const req = context.switchToHttp().getRequest();
    const user = req.user; // Asume que el usuario y su rol están adjuntos aquí

    if (!user) {
      throw new BadRequestException('Usuario no encontrado en la petición. Asegúrese de usar JwtAuthGuard.');
    }

    // 3. Verificar si el rol del usuario está en los roles requeridos
    if (!requiredRoles.includes(user.role as UserRole)) {
      throw new ForbiddenException(
        `El usuario (${user.email}) necesita un rol válido: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}