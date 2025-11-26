import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config'; 
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ExercisesModule } from './exercises/exercises.module';
import { RoutinesModule } from './routines/routines.module';
import { ProgressModule } from './progress/progress.module';
import { RoutineExercisesModule } from './routine-exercises/routine-exercises.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
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


