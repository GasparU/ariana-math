import { Controller, Get, Post, Body } from '@nestjs/common';
import { ResultsService } from './results.service';
import { CreateResultDto } from './dto/create-result.dto';

@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Post()
  create(@Body() createResultDto: CreateResultDto) {
    return this.resultsService.create(createResultDto);
  }

  @Get('stats')
  getStats() {
    return this.resultsService.getStats();
  }

  @Get('history') 
  getHistory() {
    return this.resultsService.getHistory();
  }
}
