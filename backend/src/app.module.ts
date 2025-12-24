import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from './gemini/gemini.module';
import { SupabaseModule } from './common/supabase/supabase.module'; // <--- Importar
import { ExamModule } from './exam/exam.module';
import { ResultsModule } from './results/results.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga .env globalmente
    SupabaseModule,
    GeminiModule,
    ExamModule,
    ResultsModule,
    RagModule,
  ],
})
export class AppModule {}
