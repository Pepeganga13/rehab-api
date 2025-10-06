import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// La interfaz ProfileData es opcional pero ayuda a tipar la respuesta
export interface ProfileData {
  id: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  // El cliente de Supabase se inyecta gracias al SupabaseModule configurado como @Global()
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * RF1: Registra un nuevo usuario y su perfil con el rol específico.
   * La tabla 'profiles' en Supabase debe existir y tener las columnas: id (UUID), email (text), role (text).
   */
  async register(registerDto: RegisterDto): Promise<{ message: string; user: ProfileData }> {
    const { email, password, role } = registerDto;

    // 1. Crear el usuario en el sistema de Auth de Supabase
    // Supabase maneja el hashing de la contraseña y la verificación por email.
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // Manejar errores como "User already registered" o contraseñas débiles
      throw new BadRequestException(
        `Error de registro: ${authError.message}`,
      );
    }

    if (!authData.user) {
      throw new BadRequestException('No se pudo obtener el usuario después del registro.');
    }
    const userId = authData.user.id;

    // 2. Insertar el perfil del usuario (con el rol) en la tabla 'profiles' de PostgreSQL
    const { error: profileError } = await this.supabase
      .from('profiles') // <-- ¡Asegúrate de que este nombre de tabla coincida con tu esquema de Supabase!
      .insert({
        id: userId,
        email: email,
        role: role, // 'Paciente', 'Profesional de la salud', o 'Administrador'
      });

    if (profileError) {
      // Si falla la inserción del perfil, es crucial manejar el error.
      // Se recomienda en un entorno real revertir el registro de auth si esto falla.
      // Aquí, por simplicidad, solo lanzamos una excepción.
      throw new BadRequestException(
        `Error al crear el perfil: ${profileError.message}`,
      );
    }

    // Devuelve una confirmación
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

    // 1. Iniciar sesión usando el servicio de Auth de Supabase
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase devuelve un error si las credenciales son incorrectas o el usuario no está verificado
      throw new BadRequestException(
        'Credenciales inválidas, usuario no encontrado, o cuenta no verificada.',
      );
    }
    
    // Si es exitoso, Supabase devuelve automáticamente un objeto de sesión que incluye el JWT.
    return {
      message: 'Login exitoso',
      token: data.session.access_token, // <-- Este es el JWT de seguridad (RF2)
      user: data.user, // Contiene info básica del usuario (id, email)
    };
  }
}