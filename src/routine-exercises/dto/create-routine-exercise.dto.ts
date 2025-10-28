import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoutineExerciseDto {
  @IsNumber()
  @Min(1, { message: 'El ID de la rutina debe ser un número positivo' })
  routine_id: number;

  @IsNumber()
  @Min(1, { message: 'El ID del ejercicio debe ser un número positivo' })
  exercise_id: number;

  @IsNumber()
  @Min(1, { message: 'El número de repeticiones debe ser al menos 1' })
  repetitions: number;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'La duración no puede ser negativa' })
  duration_seconds?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}