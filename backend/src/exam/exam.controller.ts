import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // 1. Endpoint para VISTA PREVIA (Solo IA, no Base de Datos)
  @Post('preview')
  preview(
    @Body() createExamDto: CreateExamDto,
    @Query('visitorId') visitorId: string,
  ) {
    return this.examService.preview(createExamDto, visitorId || 'anon');
  }

  // 2. Endpoint para GUARDAR (Recibe el examen aprobado y lo guarda)
  @Post()
  create(
    @Body() createExamDto: CreateExamDto,
    @Query('visitorId') visitorId: string, // Capturamos el ID del frontend
  ) {
    // Pasamos el visitorId al servicio (si no viene, usa 'anon')
    return this.examService.create(createExamDto, visitorId || 'anon');
  }

  @Get()
  findAll(@Query('visitorId') visitorId: string) {
    return this.examService.findAll(visitorId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examService.remove(id);
  }
}
