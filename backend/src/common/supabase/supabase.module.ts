import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (configService: ConfigService) => {
        // 1. Obtenemos las variables
        const supabaseUrl = configService.get<string>('SUPABASE_URL');
        const supabaseKey = configService.get<string>('SUPABASE_KEY');

        // 2. VALIDACIÓN DE SEGURIDAD (Defensive Programming)
        // Si alguna no existe, detenemos la app y avisamos cuál falta.
        if (!supabaseUrl || !supabaseKey) {
          throw new Error(
            'FATAL ERROR: Las variables SUPABASE_URL o SUPABASE_KEY no están definidas en el archivo .env',
          );
        }

        // 3. Ahora TypeScript sabe que son strings seguros
        return createClient(supabaseUrl, supabaseKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class SupabaseModule {}
