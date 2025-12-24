import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
  Delete,
  Patch,
  Query,
  InternalServerErrorException, // <--- Importante
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagService } from './rag.service';
import * as fs from 'fs'; // <--- Importante
import * as path from 'path'; // <--- Importante

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    console.log('📥 [RAG Controller] Iniciando subida...');

    try {
      // 1. VALIDACIÓN BÁSICA
      if (!file) {
        throw new Error(
          'No se recibió ningún archivo. Revisa el tamaño o el formato.',
        );
      }
      console.log(
        `📄 Archivo recibido: ${file.originalname} (${file.size} bytes)`,
      );

      // 2. SEGURIDAD DE CARPETA (El fix clave)
      // Aseguramos que la carpeta uploads exista, si no, Multer falla en silencio o al leer.
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        console.log('📁 Carpeta uploads no existe. Creándola...');
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const subject = body.course || body.subject || 'matematica';

      const metadata = {
        subject: subject.toLowerCase(),
        grade: body.grade,
        source: body.source,
        year: body.year,
        topic: body.source || body.topic || 'General',
        stage: body.stage || 'any',
        uploadDate: new Date().toISOString(),
        source_filename: file.originalname,
      };

      // 3. PROCESAMIENTO
      // Si Multer no guardó en disco (file.path undefined), guardamos el buffer manualmente.
      let filePath = file.path;
      if (!filePath) {
        console.log('💾 Guardando buffer temporalmente...');
        filePath = path.join(uploadDir, `temp_${Date.now()}.pdf`);
        fs.writeFileSync(filePath, file.buffer);
      }

      console.log('🧠 Enviando a RagService:', filePath);

      const topicsList = await this.ragService.processDocument(
        filePath,
        metadata,
      );

      console.log('✅ RAG Procesado exitosamente.');
      return {
        message: 'Documento procesado e indexado',
        topicsFound: topicsList,
      };
    } catch (error) {
      console.error('❌ ERROR CRÍTICO EN RAG UPLOAD:', error);
      throw new InternalServerErrorException(
        `Error procesando PDF: ${error.message}`,
      );
    }
  }

  // ... (Mantén el resto de tus métodos: deleteTopic, renameTopic, getCourses, etc.)
  @Delete('topic')
  async deleteTopic(
    @Query('course') course: string,
    @Query('topic') topic: string,
  ) {
    return this.ragService.deleteTopic(course, topic);
  }

  @Patch('topic')
  async renameTopic(
    @Body() body: { course: string; oldName: string; newName: string },
  ) {
    return this.ragService.renameTopic(body.course, body.oldName, body.newName);
  }

  @Get('courses')
  async getCourses() {
    return this.ragService.getCustomCourses();
  }

  @Post('courses')
  async addCourse(@Body() body: any) {
    const courseName = body.name || body.course;
    return this.ragService.addCustomCourse(courseName);
  }

  @Delete('courses')
  async deleteCourse(@Query('name') name: string) {
    return this.ragService.deleteCustomCourse(name);
  }

  @Patch('courses')
  async renameCourse(@Body() body: { oldName: string; newName: string }) {
    return this.ragService.renameCustomCourse(body.oldName, body.newName);
  }
  @Get(['', 'files'])
  async getAllFiles() {
    return this.ragService.getRagInventory();
  }
}
