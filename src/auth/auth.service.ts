import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface ProfileData {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * RF1: Registra un nuevo usuario y su perfil con el rol específico.
   * La tabla 'profiles' en Supabase debe existir y tener las columnas: id (UUID), email (text), role (text).
   */
  async register(registerDto: RegisterDto): Promise<{ message: string; user: ProfileData }> {
    const { email, password, role } = registerDto;

    // 1. Crear el usuario en el sistema de Auth de Supabase
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new BadRequestException(
        `Error de registro: ${authError.message}`,
      );
    }

    if (!authData.user) {
      throw new BadRequestException('No se pudo obtener el usuario después del registro.');
    }
    const userId = authData.user.id;

    const { error: profileError } = await this.supabase
      .from('profiles') 
      .insert({
        id: userId,
        email: email,
        role: role, 
      });

    if (profileError) {
      throw new BadRequestException(
        `Error al crear el perfil: ${profileError.message}`,
      );
    }

    return {
      message:
        'Registro exitoso. Se ha enviado un correo para verificar la cuenta.',
      user: { id: userId, email, role },
    };
  }

  /**
   * RF2: Permite el inicio de sesión seguro y retorna el token JWT de Supabase.
   */
  async login(loginDto: LoginDto): Promise<{ message: string; token: string; user: any }> {
    const { email, password } = loginDto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new BadRequestException(
        'Credenciales inválidas, usuario no encontrado, o cuenta no verificada.',
      );
    }
    
    return {
      message: 'Login exitoso',
      token: data.session.access_token,
      user: data.user, 
    };
  }
}