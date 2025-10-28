import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateRoutineExerciseDto } from './dto/create-routine-exercise.dto';
import { UpdateRoutineExerciseDto } from './dto/update-routine-exercise.dto';

@Injectable()
export class RoutineExercisesService {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(createRoutineExerciseDto: CreateRoutineExerciseDto) {
    const { data, error } = await this.supabase
      .from('routine_exercises')
      .insert(createRoutineExerciseDto)
      .select(`
        *,
        exercise:exercises (id, name, category, body_part, difficulty)
      `)
      .single();

    if (error) {
      throw new Error(`Error al crear ejercicio en rutina: ${error.message}`);
    }
    return data;
  }

  async findAllByRoutine(routineId: number) {
    const { data, error } = await this.supabase
      .from('routine_exercises')
      .select(`
        id,
        repetitions,
        duration_seconds,
        notes,
        exercise:exercises (id, name, description, category, body_part, difficulty, video_url, image_url)
      `)
      .eq('routine_id', routineId)
      .order('id');

    if (error) {
      throw new Error(`Error al obtener ejercicios de la rutina: ${error.message}`);
    }
    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('routine_exercises')
      .select(`
        *,
        exercise:exercises (id, name, description, category, body_part, difficulty),
        routine:routines (id, name, patient_id, professional_id)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(`Ejercicio de rutina con ID ${id} no encontrado`);
    }
    return data;
  }

  async update(id: number, updateRoutineExerciseDto: UpdateRoutineExerciseDto) {
    // Verificar si existe
    await this.findOne(id);

    const { data, error } = await this.supabase
      .from('routine_exercises')
      .update(updateRoutineExerciseDto)
      .eq('id', id)
      .select(`
        *,
        exercise:exercises (id, name, category, body_part)
      `)
      .single();

    if (error) {
      throw new Error(`Error al actualizar ejercicio de rutina: ${error.message}`);
    }
    return data;
  }

  async remove(id: number) {
    // Verificar si existe
    await this.findOne(id);

    const { error } = await this.supabase
      .from('routine_exercises')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar ejercicio de rutina: ${error.message}`);
    }
    return { message: 'Ejercicio eliminado de la rutina correctamente' };
  }

  // Método para agregar múltiples ejercicios a una rutina
  async addExercisesToRoutine(routineId: number, exercises: CreateRoutineExerciseDto[]) {
    const exercisesToInsert = exercises.map(exercise => ({
      ...exercise,
      routine_id: routineId,
    }));

    const { data, error } = await this.supabase
      .from('routine_exercises')
      .insert(exercisesToInsert)
      .select(`
        *,
        exercise:exercises (id, name, category, body_part)
      `);

    if (error) {
      throw new Error(`Error al agregar ejercicios a la rutina: ${error.message}`);
    }
    return data;
  }
}