import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Asume que el AuthGuard ha adjuntado el objeto user a la request
export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Devuelve el objeto user completo o, si se pide, solo el ID
    if (data === 'id') {
        return request.user.id; 
    }
    return request.user;
  },
);