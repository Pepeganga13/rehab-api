import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres.' })
  password: string;

  // El rol debe ser uno de los definidos en tu propuesta
  @IsString()
  @IsIn(['Paciente', 'Profesional de la salud', 'Administrador'], {
    message: 'El rol debe ser Paciente, Profesional de la salud o Administrador.',
  })
  role: string;
}