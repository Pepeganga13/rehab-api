import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Controller('exercises') // La ruta base será /exercises
@UsePipes(new ValidationPipe({ transform: true })) // Aplica validación a todos los endpoints
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  // POST /exercises
  @Post()
  create(@Body() createExerciseDto: CreateExerciseDto) {
    // RF4: Solo Profesionales/Administradores deberían tener acceso a esta ruta (falta Guard)
    return this.exercisesService.create(createExerciseDto);
  }

  // GET /exercises - (RF4: Biblioteca)
  @Get()
  findAll() {
    return this.exercisesService.findAll();
  }

  // GET /exercises/1
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.findOne(id);
  }

  // PATCH /exercises/1
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateExerciseDto: UpdateExerciseDto) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  // DELETE /exercises/1
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.exercisesService.remove(id);
  }
}