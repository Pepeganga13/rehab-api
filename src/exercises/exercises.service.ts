import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(createExerciseDto: CreateExerciseDto, professionalId: string) {
    const { data, error } = await this.supabase
      .from('exercises')
      .insert({
        ...createExerciseDto,
        created_by: professionalId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear ejercicio: ${error.message}`);
    }
    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) {
      throw new Error(`Error al obtener ejercicios: ${error.message}`);
    }
    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new NotFoundException(`Ejercicio con ID ${id} no encontrado`);
    }
    return data;
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto) {
    // Verificar si existe primero
    await this.findOne(id);

    const { data, error } = await this.supabase
      .from('exercises')
      .update(updateExerciseDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar ejercicio: ${error.message}`);
    }
    return data;
  }

  async remove(id: number) {
    // Verificar si existe primero
    await this.findOne(id);

    const { error } = await this.supabase
      .from('exercises')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar ejercicio: ${error.message}`);
    }
    return { message: 'Ejercicio eliminado correctamente' };
  }

  // Nuevo método para buscar por categoría (RF3)
  async findByCategory(category: string) {
    const { data, error } = await this.supabase
      .from('exercises')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      throw new Error(`Error al buscar ejercicios por categoría: ${error.message}`);
    }
    return data;
  }
}