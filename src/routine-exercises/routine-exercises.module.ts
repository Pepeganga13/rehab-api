import { Module } from '@nestjs/common';
import { RoutineExercisesController } from './routine-exercises.controller';
import { RoutineExercisesService } from './routine-exercises.service';

@Module({
  controllers: [RoutineExercisesController],
  providers: [RoutineExercisesService],
  exports: [RoutineExercisesService],
})
export class RoutineExercisesModule {}