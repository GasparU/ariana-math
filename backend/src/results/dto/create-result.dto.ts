import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateResultDto {
  @IsString()
  @IsNotEmpty()
  exam_id: string; // ID del examen que resolvió

  @IsString() // <--- NUEVO
  @IsNotEmpty()
  subject: string;

  @IsNumber()
  @IsNotEmpty()
  score: number; // Cuántas acertó (ej: 8)

  @IsNumber()
  @IsNotEmpty()
  total_questions: number; // Total (ej: 10)

  @IsString()
  @IsNotEmpty()
  topic: string; // Tema (ej: "Fracciones")

  @IsObject()
  @IsOptional()
  details: any; // Opcional: Guardar qué preguntas falló específicamente

  @IsObject()
  @IsOptional()
  answers: Record<string, string>; // Ej: { "q_1": "opt_a", "q_2": "opt_c" }
}
