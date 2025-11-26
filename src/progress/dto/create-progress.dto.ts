import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateProgressDto {
  @IsNumber()
  routine_exercise_id: number;

  @IsBoolean()
  completed: boolean;

  @IsNumber()
  @Min(1, { message: 'El nivel de dolor debe ser entre 1 y 10' })
  @Max(10, { message: 'El nivel de dolor debe ser entre 1 y 10' })
  pain_level: number;

  @IsNumber()
  @Min(1, { message: 'La dificultad debe ser entre 1 y 5' })
  @Max(5, { message: 'La dificultad debe ser entre 1 y 5' })
  difficulty: number;

  @IsString()
  @IsOptional()
  notes?: string;
}