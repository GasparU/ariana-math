import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { GeminiModule } from '../gemini/gemini.module';
// No necesitamos importar SupabaseModule aquí porque le pusimos @Global()

@Module({
  imports: [GeminiModule],
  controllers: [ExamController],
  providers: [ExamService],
})
export class ExamModule {}
