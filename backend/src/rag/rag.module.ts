import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { OcrService } from './ocr.service';

@Module({
  imports: [ConfigModule], 
  controllers: [RagController],
  providers: [RagService, OcrService],
  exports: [RagService], 
})
export class RagModule {}
