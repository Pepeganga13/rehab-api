import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; 
import * as path from 'path'; // Necesario para la manipulación de rutas

// Módulos de la aplicación
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { ProgressModule } from './progress/progress.module';
import { RoutineExercisesModule } from './routine-exercises/routine-exercises.module';


@Module({
  imports: [
    // 🚨 ÚLTIMA CORRECCIÓN: Usar process.cwd() para determinar la raíz
    ConfigModule.forRoot({
      isGlobal: true,
      // path.join(process.cwd(), '.env') siempre apunta a: /rehab-api/.env
      envFilePath: path.join(process.cwd(), '.env'), 
    }), 
    
    // Módulos de la aplicación
    SupabaseModule,
    AuthModule,
    ExercisesModule,
    RoutinesModule,
    ProgressModule,
    RoutineExercisesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}