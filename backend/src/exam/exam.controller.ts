import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './dto/create-exam.dto';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  // 1. Endpoint para VISTA PREVIA (Solo IA, no Base de Datos)
  @Post('preview')
  preview(@Body() createExamDto: CreateExamDto) {
    return this.examService.preview(createExamDto);
  }

  // 2. Endpoint para GUARDAR (Recibe el examen aprobado y lo guarda)
  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examService.create(createExamDto, 'anon');
  }

  @Get()
  findAll() {
    return this.examService.findAll();
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
