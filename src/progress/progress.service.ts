import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProgressDto } from './dto/create-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(createProgressDto: CreateProgressDto, patientId: string) {
    // Verificar que el routine_exercise_id existe y pertenece al paciente
    const { data: routineExercise, error: reError } = await this.supabase
      .from('routine_exercises')
      .select(`
        id,
        routine:routines (
          id,
          patient_id
        )
      `)
      .eq('id', createProgressDto.routine_exercise_id)
      .single();

    if (reError || !routineExercise) {
      throw new NotFoundException('Ejercicio de rutina no encontrado');
    }

    // Verificar que la rutina pertenece al paciente
    const routine = Array.isArray(routineExercise.routine)
      ? routineExercise.routine[0]
      : routineExercise.routine;
    if (!routine || routine.patient_id !== patientId) {
      throw new NotFoundException('No tienes permiso para registrar progreso en este ejercicio');
    }

    const { data, error } = await this.supabase
      .from('progress')
      .insert({
        ...createProgressDto,
        patient_id: patientId,
        completed_at: new Date().toISOString()
      })
      .select(`
        *,
        routine_exercise:routine_exercises (
          repetitions,
          duration_seconds,
          notes,
          exercise:exercises (id, name, category, body_part)
        )
      `)
      .single();

    if (error) {
      throw new Error(`Error al registrar progreso: ${error.message}`);
    }
    return data;
  }

  async findByPatient(patientId: string) {
    const { data, error } = await this.supabase
      .from('progress')
      .select(`
        id,
        completed,
        pain_level,
        difficulty,
        notes,
        completed_at,
        routine_exercise:routine_exercises (
          repetitions,
          duration_seconds,
          exercise:exercises (name, category, body_part),
          routine:routines (name, patient_id)
        )
      `)
      .eq('patient_id', patientId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener progreso: ${error.message}`);
    }
    return data;
  }

  async findByRoutine(routineId: number, patientId: string) {
    const { data, error } = await this.supabase
      .from('progress')
      .select(`
        id,
        completed,
        pain_level,
        difficulty,
        notes,
        completed_at,
        routine_exercise:routine_exercises (
          repetitions,
          duration_seconds,
          exercise:exercises (name, category),
          routine:routines (name)
        )
      `)
      .eq('patient_id', patientId)
      .eq('routine_exercises.routine_id', routineId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Error al obtener progreso por rutina: ${error.message}`);
    }
    return data;
  }

  // Para reportes del profesional (RF8)
  async getPatientProgressReport(patientId: string) {
    const { data, error } = await this.supabase
      .from('progress')
      .select(`
        completed_at,
        completed,
        pain_level,
        difficulty,
        routine_exercise:routine_exercises (
          exercise:exercises (name, category)
        )
      `)
      .eq('patient_id', patientId)
      .order('completed_at', { ascending: true });

    if (error) {
      throw new Error(`Error al generar reporte: ${error.message}`);
    }

    // Calcular métricas básicas
    const totalExercises = data.length;
    const completedExercises = data.filter(p => p.completed).length;
    const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
    const averagePainLevel = totalExercises > 0 
      ? data.reduce((sum, p) => sum + p.pain_level, 0) / totalExercises 
      : 0;

    return {
      patient_id: patientId,
      summary: {
        total_exercises: totalExercises,
        completed_exercises: completedExercises,
        completion_rate: Math.round(completionRate),
        average_pain_level: Math.round(averagePainLevel * 10) / 10
      },
      progress_data: data
    };
  }
}