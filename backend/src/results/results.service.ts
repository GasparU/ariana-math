import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../common/supabase/supabase.module';
import { CreateResultDto } from './dto/create-result.dto';

@Injectable()
export class ResultsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  // 1. Guardar un resultado nuevo
  async create(dto: CreateResultDto) {
    const { data, error } = await this.supabase
      .from('exam_results')
      .insert(dto)
      .select()
      .single();

    if (error)
      throw new InternalServerErrorException(
        'Error guardando resultado: ' + error.message,
      );
    return data;
  }

  // 2. Obtener Estadísticas (Dominio por tema)
  async getStats() {
    // Consultamos la VISTA SQL 'topic_mastery' que creamos antes
    const { data, error } = await this.supabase
      .from('topic_mastery')
      .select('*')
      .order('mastery_percentage', { ascending: true }); // Los más débiles primero

    if (error) {
      // Si la vista no existe, devolvemos array vacío para no romper nada
      console.error(error);
      return [];
    }
    return data;
  }

  async getHistory() {
    const { data, error } = await this.supabase
      .from('exam_results') // Consultamos la tabla de resultados
      .select('*') // Traemos todas las columnas (nota, tema, fecha...)
      .order('completed_at', { ascending: false }); // Ordenamos: El más reciente primero

    if (error) {
      console.error('Error fetching history:', error);
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
