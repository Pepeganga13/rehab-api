import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsISO8601,
  IsArray,
  IsNumber,
  IsOptional,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';


export class RoutineExerciseDto {
  @IsNumber()
  @Min(1, { message: 'El ID del ejercicio debe ser un número positivo.' })
  exercise_id: number;

  @IsNumber()
  @Min(1, { message: 'El número de repeticiones debe ser al menos 1.' })
  repetitions: number; 

  @IsNumber()
  @IsOptional()
  @Min(0)
  duration_seconds?: number; 

  @IsString()
  @IsOptional()
  notes?: string; 
}


export class CreateRoutineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  patient_id: string;
  
  @IsISO8601()
  @IsNotEmpty()
  start_date: string; 

  @IsISO8601()
  @IsNotEmpty()
  end_date: string; 

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseDto)
  exercises: RoutineExerciseDto[];
}