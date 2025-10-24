import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly supabase: SupabaseClient) {}

  // C: CREATE (Crear Ejercicio)
  async create(createExerciseDto: CreateExerciseDto) {
    // Aquí podrías obtener el ID del usuario logueado (Profesional) para asignarlo a professional_id.
    const { data, error } = await this.supabase
      .from('exercises')
      .insert([createExerciseDto])
      .select(); 

    if (error) {
      throw new BadRequestException(`Error al crear el ejercicio: ${error.message}`);
    }
    
    return data[0];
  }

  // R: READ ALL (Obtener toda la biblioteca) - RF4
  async findAll() {
    // Retorna todos los ejercicios, ordenados por categoría (RF5)
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .order('category', { ascending: true }); 

    if (error) {
      throw new BadRequestException(`Error al obtener ejercicios: ${error.message}`);
    }

    return data;
  }

  // R: READ ONE (Obtener un ejercicio por ID)
  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        throw new NotFoundException(`Ejercicio con ID ${id} no encontrado.`);
      }
      throw new BadRequestException(`Error al buscar ejercicio: ${error.message}`);
    }

    return data;
  }

  // U: UPDATE (Actualizar Ejercicio)
  async update(id: number, updateExerciseDto: UpdateExerciseDto) {
    const { data, error } = await this.supabase
      .from('exercises')
      .update(updateExerciseDto)
      .eq('id', id)
      .select();

    if (error) {
      throw new BadRequestException(`Error al actualizar el ejercicio: ${error.message}`);
    }
    
    if (data.length === 0) {
      throw new NotFoundException(`Ejercicio con ID ${id} no encontrado para actualizar.`);
    }

    return data[0];
  }

  // D: DELETE (Eliminar Ejercicio)
  async remove(id: number) {
    const { error } = await this.supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Error al eliminar el ejercicio: ${error.message}`);
    }

    return { message: `Ejercicio con ID ${id} eliminado exitosamente.` };
  }
}