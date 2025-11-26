import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { UpdateRoutineDto } from './dto/update-routine.dto';
import { UserRole } from '../auth/roles/user-role.enum';

@Injectable()
export class RoutinesService {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(createRoutineDto: CreateRoutineDto, professionalId: string) {
    const { exercises, ...routineData } = createRoutineDto;

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

    const routineExercisesData = exercises.map(exercise => ({
        ...exercise,
        routine_id: routineId, 
    }));

    const { error: exercisesError } = await this.supabase
        .from('routine_exercises')
        .insert(routineExercisesData);

    if (exercisesError) {
         await this.supabase.from('routines').delete().eq('id', routineId);
         throw new BadRequestException(`Error al asignar ejercicios a la rutina: ${exercisesError.message}`);
    }

    return this.findOne(routineId, professionalId, UserRole.Professional); 
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('routines')
      .select(`
        *,
        routine_exercises (
          repetitions,
          duration_seconds,
          notes,
          exercise:exercises (id, name, description, category, body_part)
        )
      `)
      .order('id', { ascending: false });

    if (error) {
      throw new BadRequestException(`Error al buscar rutinas: ${error.message}`);
    }
    return data;
  }

  async findRoutinesByPatientId(patientId: string) {
    const { data, error } = await this.supabase
      .from('routines')
      .select(`
        id,
        name,
        start_date,
        end_date,
        professional_id,
        routine_exercises (
          repetitions,
          duration_seconds,
          notes,
          exercise:exercises (id, name, description, category, body_part)
        )
      `)
      .eq('patient_id', patientId)
      .order('id', { ascending: false });

    if (error) {
      throw new BadRequestException(`Error al buscar rutinas del paciente: ${error.message}`);
    }
    return data;
  }

  async findOne(id: number, userId: string, userRole: UserRole) {
    const routineQuery = this.supabase
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
          repetitions,
          duration_seconds,
          notes,
          exercise:exercises (id, name, description, category, body_part)
        )
      `)
      .eq('id', id)
      .single();
    
    const { data, error } = await routineQuery;

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Rutina con ID ${id} no encontrada.`);
      }
      throw new BadRequestException(`Error al buscar rutina: ${error.message}`);
    }

    if (userRole === UserRole.Patient && data.patient_id !== userId) {
        throw new NotFoundException(`Rutina con ID ${id} no encontrada o no pertenece al paciente.`);
    }

    return data;
  }

  async update(id: number, updateRoutineDto: UpdateRoutineDto) {
    const { data, error } = await this.supabase
      .from('routines')
      .update(updateRoutineDto)
      .eq('id', id)
      .select(`id, professional_id`)
      .single();

    if (error) {
        throw new BadRequestException(`Error al actualizar rutina: ${error.message}`);
    }
    if (!data) {
        throw new NotFoundException(`Rutina con ID ${id} no encontrada.`);
    }

    return this.findOne(id, data.professional_id, UserRole.Professional);
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('routines')
      .delete()
      .eq('id', id)
      .single();

    if (error) {
        if (error.code === 'PGRST116') { 
            throw new NotFoundException(`Rutina con ID ${id} no encontrada.`);
        }
        throw new BadRequestException(`Error al eliminar rutina: ${error.message}`);
    }

    return { message: `Rutina con ID ${id} eliminada correctamente.` };
  }
}