import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService, ProfileData } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // La ruta base será /auth
@UsePipes(new ValidationPipe({ transform: true })) // Para validar los DTOs
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register  <-- RF1
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<{ message: string; user: ProfileData }> {
    return this.authService.register(registerDto);
  }

  // POST /auth/login  <-- RF2
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}