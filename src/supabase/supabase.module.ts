// src/supabase/supabase.module.ts (Código Modificado)

import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SupabaseClient,
      useFactory: (): SupabaseClient => {
        // 🚨 CAMBIO A LECTURA DIRECTA DE process.env
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY; 
        
        console.log('DEBUG SUPABASE URL:', supabaseUrl ? 'FOUND' : 'NOT FOUND');
        console.log('DEBUG SUPABASE KEY:', supabaseKey ? 'FOUND' : 'NOT FOUND');

        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase URL or Key not found in environment variables.');
        }

        return createClient(supabaseUrl, supabaseKey);
      },
      // Ya no necesitamos inyectar ConfigService si usamos process.env directamente
      // Puedes eliminar la línea: inject: [ConfigService],
    },
  ],
  exports: [SupabaseClient],
})
export class SupabaseModule {}