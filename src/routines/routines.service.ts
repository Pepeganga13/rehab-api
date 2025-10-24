import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(private readonly supabase: SupabaseClient) {}

  // C: CREATE (Crear y Asignar Rutina) - RF3 y RF6
  async create(createRoutineDto: CreateRoutineDto, professionalId: string) {
    const { exercises, ...routineData } = createRoutineDto;

    // 1. Insertar la rutina base en la tabla 'routines'
    const { data: routineResult, error: routineError } = await this.supabase
      .from('routines')
      .insert({
        ...routineData,
        professional_id: professionalId, // ID del profesional obtenida del token
      })
      .select('id')
      .single();

    if (routineError) {
      throw new BadRequestException(`Error al crear la rutina: ${routineError.message}`);
    }

    const routineId = routineResult.id;

    // 2. Preparar los datos para la tabla pivote 'routine_exercises'
    const routineExercisesToInsert = exercises.map(ex => ({
      ...ex,
      routine_id: routineId,
    }));

    // 3. Insertar las relaciones en la tabla pivote
    const { error: exercisesError } = await this.supabase
      .from('routine_exercises')
      .insert(routineExercisesToInsert);

    if (exercisesError) {

      throw new BadRequestException(`Error al asignar ejercicios a la rutina: ${exercisesError.message}`);
    }

    // 4. Leer la rutina completa (con ejercicios) para devolverla
    return this.findOne(routineId); 
  }

  // (Obtener Rutina con sus Ejercicios)
  async findOne(id: number) {
    // Consulta JOIN para obtener la rutina y sus ejercicios asociados
    const { data, error } = await this.supabase
      .from('routines')
      .select(`
        id,
        name,
        start_date,
        end_date,
        patient_id,
        professional_id,
        exercises:routine_exercises (
            repetitions,
            duration_seconds,
            notes,
            exercise:exercises (id, name, category, body_part)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
        if (error.code === 'PGRST116') {
            throw new NotFoundException(`Rutina con ID ${id} no encontrada.`);
        }
        throw new BadRequestException(`Error al buscar rutina: ${error.message}`);
    }

    return data;
  }
  
  
  async findAll() {

      const { data, error } = await this.supabase.from('routines').select('*');
      if (error) throw new BadRequestException(`Error al obtener rutinas: ${error.message}`);
      return data;
  }
}