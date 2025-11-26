import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req, // Incluimos @Req() solo por si el decorador @GetUser() falla
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; 
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { UserRole } from '../auth/roles/user-role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator'; // Decorador para extraer datos del usuario

@Controller('exercises')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt')) // 🚨 Protege TODO el controlador con la autenticación JWT
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  // --- 1. CREATE: POST /exercises (Solo Profesionales o Admin) ---
  @Post()
  @RoleProtected(UserRole.Professional, UserRole.Admin) 
  @UseGuards(UserRoleGuard) // Aplicar el guard de rol
  create(
    @Body() createExerciseDto: CreateExerciseDto,
    // 🚨 Extrae el ID del usuario verificado ({ id: 'UUID', role: '...' })
    @GetUser('id') professionalId: string, 
  ) {
    // El ID debería ser el UUID del profesional logueado
    console.log('ID del Profesional extraído:', professionalId); // DEBUG: Verificar valor
    return this.exercisesService.create(createExerciseDto, professionalId);
  }

  // --- 2. READ ALL: GET /exercises (Todos los usuarios logueados) ---
  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  // --- 3. READ ALL BY CATEGORY: GET /exercises/category/:category (Todos los usuarios logueados) ---
  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.exercisesService.findByCategory(category);
  }

  // --- 4. READ ONE: GET /exercises/:id (Todos los usuarios logueados) ---
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.findOne(id);
  }

  // --- 5. UPDATE: PATCH /exercises/:id (Solo Profesionales o Admin) ---
  @Patch(':id')
  @RoleProtected(UserRole.Professional, UserRole.Admin)
  @UseGuards(UserRoleGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  // --- 6. DELETE: DELETE /exercises/:id (Solo Profesionales o Admin) ---
  @Delete(':id')
  @RoleProtected(UserRole.Professional, UserRole.Admin)
  @UseGuards(UserRoleGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.remove(id);
  }
}