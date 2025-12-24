import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  IsObject,
} from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  difficulty: string;

  @IsString()
  @IsNotEmpty()
  grade_level: string;

  @IsInt()
  @Min(1)
  @Max(50)
  num_questions: number;

  @IsOptional()
  @IsInt()
  time_limit?: number;

  @IsOptional()
  @IsString()
  stage?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  aiModel?: string;

  @IsOptional()
  @IsObject()
  content?: any;

  @IsOptional()
  @IsString()
  source?: string;
}
