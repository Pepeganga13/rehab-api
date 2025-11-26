import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Controller('routines')
@UsePipes(new ValidationPipe({ transform: true }))
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  // 1. CREATE: POST /routines (Asignación y Creación - RF3/RF6)
  @Post()
  create(@Body() createRoutineDto: CreateRoutineDto) {
    const professionalId = 'a8e8c66c-2632-4bec-907a-aa7a32905843'; // Reemplazar con el ID real del profesional logueado
    return this.routinesService.create(createRoutineDto, professionalId);
  }

  // 2. READ ALL: GET /routines
  @Get()
  findAll() {
    return this.routinesService.findAll();
  }

  // 3. READ ONE: GET /routines/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routinesService.findOne(id);
  }
  
  // Los endpoints PATCH y DELETE deben implementarse una vez probada la creación.
}