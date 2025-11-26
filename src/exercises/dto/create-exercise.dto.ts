import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Clasificación por categorías (RF5)
  @IsString()
  @IsNotEmpty()
  @IsIn(['Movilidad', 'Fuerza', 'Equilibrio', 'Respiración', 'Resistencia'], {
    message: 'La categoría debe ser una de las clasificaciones válidas.',
  })
  category: string;

  @IsString()
  @IsNotEmpty()
  body_part: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}