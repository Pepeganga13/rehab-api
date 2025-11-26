import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly supabase: SupabaseClient,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: any) {
    const userId = payload.sub; 

    const { data: user, error } = await this.supabase
      .from('profiles')    
      .select('id, role')
      .eq('id', userId)
      .single();

    if (!user || error) {
      throw new UnauthorizedException('Perfil de usuario no encontrado o sin rol asignado.');
    }

    return {
      id: user.id,
      role: user.role,   
    };
  }
}
