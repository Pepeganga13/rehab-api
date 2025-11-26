import { Body, Controller, Get, Param, ParseIntPipe, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
@UsePipes(new ValidationPipe({ transform: true }))
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  create(@Body() createProgressDto: CreateProgressDto) {
    const patientId = 'patient-id-temporal'; // Reemplazar con patientId del token
    return this.progressService.create(createProgressDto, patientId);
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.progressService.findByPatient(patientId);
  }

  @Get('routine/:routineId/patient/:patientId')
  findByRoutine(
    @Param('routineId', ParseIntPipe) routineId: number,
    @Param('patientId') patientId: string
  ) {
    return this.progressService.findByRoutine(routineId, patientId);
  }

  @Get('report/:patientId')
  getPatientReport(@Param('patientId') patientId: string) {
    return this.progressService.getPatientProgressReport(patientId);
  }
}