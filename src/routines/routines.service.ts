import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateRoutineDto } from './dto/create-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(private readonly supabase: SupabaseClient) {}

  // En el método create, simplificamos ya que ahora RoutineExercises tiene su propio servicio
  async create(createRoutineDto: CreateRoutineDto, professionalId: string) {
    const { exercises, ...routineData } = createRoutineDto;

    // 1. Insertar solo la rutina base
    const { data: routineResult, error: routineError } = await this.supabase
      .from('routines')
      .insert({
        ...routineData,
        professional_id: professionalId,
      })
      .select('id')
      .single();

    if (routineError) {
      throw new BadRequestException(`Error al crear la rutina: ${routineError.message}`);
    }

    const routineId = routineResult.id;

    // 2. Retornar solo la rutina creada (sin ejercicios)
    // Los ejercicios se agregarán mediante el servicio de RoutineExercises
    return this.findOne(routineId);
  }

  // Modificar findOne para usar la nueva relación
  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('routines')
      .select(`
        id,
        name,
        start_date,
        end_date,
        patient_id,
        professional_id,
        created_at,
        routine_exercises (
          id,
          repetitions,
          duration_seconds,
          notes,
          exercise:exercises (id, name, description, category, body_part, difficulty)
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