import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '@nestjs/config';
// CORRECCIÓN: Ruta relativa es más segura que 'src/...'
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [ConfigModule, RagModule],
  providers: [GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
