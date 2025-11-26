// src/routines/routines.controller.ts

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  UsePipes, 
  ValidationPipe,
  UseGuards // <-- Nuevo
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Para la autenticación JWT
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { RoleProtected } from '../auth/decorators/role-protected.decorator'; // <-- Nuevo
import { UserRoleGuard } from '../auth/guards/user-role.guard'; // <-- Nuevo
import { UserRole } from '../auth/roles/user-role.enum'; // <-- Nuevo
import { GetUser } from '../auth/decorators/get-user.decorator'; // <-- Nuevo


@Controller('routines')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt')) // Proteger todo el controlador con JWT
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  // 1. CREATE: POST /routines (Asignación y Creación - RF3/RF6)
  @Post()
  @RoleProtected(UserRole.Professional, UserRole.Admin) // Proteger: Solo profesionales/admin
  @UseGuards(UserRoleGuard) 
  create(
    @Body() createRoutineDto: CreateRoutineDto,
    @GetUser('id') professionalId: string, // <-- ID extraído del token
  ) {
    return this.routinesService.create(createRoutineDto, professionalId);
  }

  // 2. READ ALL: GET /routines (Solo Profesionales o Admin pueden ver todas)
  @Get()
  @RoleProtected(UserRole.Professional, UserRole.Admin)
  @UseGuards(UserRoleGuard)
  findAll() {
    return this.routinesService.findAll();
  }
  
  // 3. NUEVO ENDPOINT (RF2): GET /routines/my-routines (Solo Pacientes)
  @Get('my-routines') 
  @RoleProtected(UserRole.Patient) // Solo pacientes pueden ver sus rutinas
  @UseGuards(UserRoleGuard)
  findMyRoutines(@GetUser('id') patientId: string) {
      // Necesitas crear findRoutinesByPatientId(patientId: string) en el Service
      return this.routinesService.findRoutinesByPatientId(patientId); 
  }

  // 4. READ ONE: GET /routines/:id (Todos los logueados, pero el Service debe verificar si es el dueño/profesional)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('id') userId: string,
    @GetUser('role') userRole: UserRole,
  ) {
    // El Service debe verificar la propiedad: si userRole es Patient, debe coincidir el userId con el patient_id de la rutina.
    return this.routinesService.findOne(id, userId, userRole);
  }
  
  // 5. UPDATE: PATCH /routines/:id (Solo Profesionales o Admin)
  @Patch(':id')
  @RoleProtected(UserRole.Professional, UserRole.Admin)
  @UseGuards(UserRoleGuard)
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRoutineDto: UpdateRoutineDto,
  ) {
    return this.routinesService.update(id, updateRoutineDto);
  }

  // 6. DELETE: DELETE /routines/:id (Solo Profesionales o Admin)
  @Delete(':id')
  @RoleProtected(UserRole.Professional, UserRole.Admin)
  @UseGuards(UserRoleGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.routinesService.remove(id);
  }
}