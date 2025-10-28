import { Type } from 'class-transformer';
import { IsArray, IsNumber, Min, ValidateNested } from 'class-validator';

export class RoutineExerciseItemDto {
  @IsNumber()
  @Min(1, { message: 'El ID del ejercicio debe ser un número positivo' })
  exercise_id: number;

  @IsNumber()
  @Min(1, { message: 'El número de repeticiones debe ser al menos 1' })
  repetitions: number;

  @IsNumber()
  @Min(0, { message: 'La duración no puede ser negativa' })
  duration_seconds?: number;

  notes?: string;
}

export class CreateRoutineExerciseBatchDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseItemDto)
  exercises: RoutineExerciseItemDto[];
}