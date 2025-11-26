import { Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateProgressDto } from './dto/create-progress.dto';
import { ProgressService } from './progress.service';
import { RoleProtected } from '../auth/decorators/role-protected.decorator';
import { UserRoleGuard } from '../auth/guards/user-role.guard';
import { UserRole } from '../auth/roles/user-role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('progress')
@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(AuthGuard('jwt')) // Proteger todo el controlador
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  // 1. CREATE: POST /progress (Solo Pacientes - RF7)
  @Post()
  @RoleProtected(UserRole.Patient) 
  @UseGuards(UserRoleGuard)
  create(
    @Body() createProgressDto: CreateProgressDto,
    @GetUser('id') patientId: string, // ID extraído del token
  ) {
    // El patientId del DTO debe ser opcional o ignorado, ya que el ID del token es el autorizado
    return this.progressService.create(createProgressDto, patientId);
  }

  // 2. READ: GET /progress/patient/:patientId (Control de acceso en el Service)
  @Get('patient/:patientId')
  @RoleProtected(UserRole.Professional, UserRole.Admin, UserRole.Patient)
  @UseGuards(UserRoleGuard)
  findByPatient(
    @Param('patientId') requestedPatientId: string,
    @GetUser('id') currentUserId: string,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    // El servicio se encarga de la lógica: ¿Puede currentUserId ver requestedPatientId?
    return this.progressService.findByPatient(requestedPatientId, currentUserId, currentUserRole);
  }

  // 3. READ: GET /progress/routine/:routineId/patient/:patientId (Control de acceso en el Service)
  @Get('routine/:routineId/patient/:patientId')
  @RoleProtected(UserRole.Professional, UserRole.Admin, UserRole.Patient)
  @UseGuards(UserRoleGuard)
  findByRoutine(
    @Param('routineId', ParseIntPipe) routineId: number,
    @Param('patientId') requestedPatientId: string,
    @GetUser('id') currentUserId: string,
    @GetUser('role') currentUserRole: UserRole,
  ) {
    // El servicio se encarga de la lógica de acceso
    return this.progressService.findByRoutine(routineId, requestedPatientId, currentUserId, currentUserRole);
  }
  
  @Get('report/:patientId')
  @RoleProtected(UserRole.Professional, UserRole.Admin) // Reportes solo para profesionales
  @UseGuards(UserRoleGuard)
  getPatientReport(@Param('patientId') patientId: string) {
    return this.progressService.getPatientProgressReport(patientId);
  }
}