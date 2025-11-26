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
    ValidationPipe
} from '@nestjs/common';
import { CreateRoutineExerciseBatchDto } from './dto/create-routine-exercise-batch.dto';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';
import { RoutineExercisesService } from './routine-exercises.service';

@Controller('routine-exercises')
@UsePipes(new ValidationPipe({ transform: true }))
export class RoutineExercisesController {
  constructor(private readonly routineExercisesService: RoutineExercisesService) {}

  @Post()
  create(@Body() createRoutineExerciseDto: CreateRoutineExerciseDto) {
    return this.routineExercisesService.create(createRoutineExerciseDto);
  }

  @Post('routine/:routineId/batch')
    addExercisesToRoutine(
    @Param('routineId', ParseIntPipe) routineId: number,
    @Body() createBatchDto: CreateRoutineExerciseBatchDto
    ) {
    // Convertir a formato CreateRoutineExerciseDto
    const exercisesWithRoutineId = createBatchDto.exercises.map(exercise => ({
        ...exercise,
        routine_id: routineId,
    }));

    return this.routineExercisesService.addExercisesToRoutine(routineId, exercisesWithRoutineId);
    }

  @Get('routine/:routineId')
  findAllByRoutine(@Param('routineId', ParseIntPipe) routineId: number) {
    return this.routineExercisesService.findAllByRoutine(routineId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.routineExercisesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoutineExerciseDto: UpdateRoutineExerciseDto
  ) {
    return this.routineExercisesService.update(id, updateRoutineExerciseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.routineExercisesService.remove(id);
  }
}