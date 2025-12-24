import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateExamDto } from './dto/create-exam.dto';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class ExamService {
  private supabase: SupabaseClient;

  constructor(
    private configService: ConfigService,
    private geminiService: GeminiService,
  ) {
    const sbUrl = this.configService.get<string>('SUPABASE_URL') || '';
    const sbKey = this.configService.get<string>('SUPABASE_KEY') || '';

    if (!sbUrl || !sbKey) throw new Error('Faltan credenciales de SUPABASE');

    this.supabase = createClient(sbUrl, sbKey);
  }

  
  async preview(createExamDto: CreateExamDto, visitorId: string = 'anon') {
    const MY_ADMIN_ID = '02e393ce-f956-442b-910e-bcef69bffa1d';
    try {
      // 1. Obtenemos TODOS los exámenes de este visitante para contar por modelo usado
      const { data: userExams, error: dbError } = await this.supabase
        .from('exams')
        .select('content')
        .eq('visitor_id', visitorId);

      if (dbError) throw dbError;

      // 2. Contabilizamos el uso por cada proveedor de IA
      const geminiUsed =
        userExams?.filter((e) =>
          e.content?.usedModel?.toLowerCase().includes('gemini'),
        ).length ?? 0;

      const deepseekUsed =
        userExams?.filter((e) =>
          e.content?.usedModel?.toLowerCase().includes('deepseek'),
        ).length ?? 0;

      // 3. Configuración de Seguridad y Fallbacks
      // Reemplaza el string de abajo por tu visitor_id completo de Supabase
      const IS_ADMIN = visitorId === MY_ADMIN_ID;
      const selectedModel = createExamDto.aiModel || 'gemini-1.5-flash';
      const modelLower = selectedModel.toLowerCase();
      let maxQuestions = 10;

      // 4. Lógica de Validación de Cuotas (Bypass para Admin)
      if (!IS_ADMIN) {
        if (modelLower.includes('gemini')) {
          if (geminiUsed >= 4) {
            throw new InternalServerErrorException(
              `Cuota de Gemini Pro agotada (${geminiUsed}/4). Por favor, prueba con el motor DeepSeek.`,
            );
          }
          maxQuestions = 10;
        } else if (modelLower.includes('deepseek')) {
          if (deepseekUsed >= 10) {
            throw new InternalServerErrorException(
              `Cuota de DeepSeek agotada (${deepseekUsed}/10). Has alcanzado el límite de la demo técnica.`,
            );
          }
          maxQuestions = 20;
        }
      } else {
        // Modo Administrador: Acceso total y mayor volumen de preguntas
        maxQuestions = 20;
        console.log('👑 Acceso Administrador: Bypass de cuotas activado.');
      }

      // 5. Preparación del DTO final y envío a la IA
      const finalDto = {
        ...createExamDto,
        aiModel: selectedModel,
        num_questions: Math.min(createExamDto.num_questions, maxQuestions),
      };

      const examContent = await this.geminiService.generateExam(finalDto);

      // 6. Retorno con metadatos para el Frontend
      return {
        ...examContent,
        usedModel: selectedModel,
        stats: {
          // Si es admin 999, si no, restamos el usado + 1 (el actual)
          geminiRemaining: IS_ADMIN
            ? 999
            : Math.max(
                0,
                4 -
                  (modelLower.includes('gemini') ? geminiUsed + 1 : geminiUsed),
              ),
          deepseekRemaining: IS_ADMIN
            ? 999
            : Math.max(
                0,
                10 -
                  (modelLower.includes('deepseek')
                    ? deepseekUsed + 1
                    : deepseekUsed),
              ),
          isAdmin: IS_ADMIN,
        },
      };
    } catch (error) {
      console.error('❌ Error en el proceso de Preview:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createExamDto: CreateExamDto, visitorId: string = 'anon') {
    try {
      let examContent = createExamDto.content;

      // 1. Si no hay contenido previo (edición), generamos uno nuevo
      if (!examContent) {
        examContent = await this.geminiService.generateExam(createExamDto);
      } else {
        // 2. Si viene de edición, recalculamos para asegurar calidad
        console.log('♻️ Recalculando solucionarios para examen editado...');
        examContent = await this.recalculateSolutions(
          examContent,
          createExamDto.aiModel || 'gemini-1.5-pro',
          createExamDto.subject,
        );
      }

      // 3. Guardado en BD incluyendo el visitor_id para el contador de cuotas
      const { data, error } = await this.supabase
        .from('exams')
        .insert({
          subject: createExamDto.subject,
          grade_level: createExamDto.grade_level,
          topic: createExamDto.topic,
          difficulty: createExamDto.difficulty,
          content: { ...examContent, usedModel: createExamDto.aiModel }, // Guardamos el modelo usado
          num_questions: createExamDto.num_questions,
          time_limit: createExamDto.time_limit,
          visitor_id: visitorId, // 🔥 CRÍTICO: Vinculamos el examen al visitante
        })
        .select()
        .single();

      if (error) throw error;
      return { ...data, ...data.content };
    } catch (error) {
      console.error('❌ Error guardando examen:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(visitorId: string = 'anon') {
    const MY_ADMIN_ID = '02e393ce-f956-442b-910e-bcef69bffa1d';
    const IS_ADMIN = visitorId === MY_ADMIN_ID;

    let query = this.supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false });

    // 🔥 FILTRO CRÍTICO: Si no es admin, solo ve sus propios exámenes
    if (!IS_ADMIN) {
      query = query.eq('visitor_id', visitorId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error BUSCANDO exámenes:', error);
      throw new InternalServerErrorException(error.message);
    }
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new InternalServerErrorException(error.message);
    return { ...data, ...data.content };
  }

  async remove(id: string) {
    // Intentamos borrar
    const { error } = await this.supabase.from('exams').delete().eq('id', id);

    if (error) {
      console.error('❌ Error BORRANDO examen:', error); // <--- AHORA SÍ VERÁS EL ERROR EN TERMINAL
      throw new InternalServerErrorException(
        `Supabase Error: ${error.message}`,
      );
    }
    return { message: 'Eliminado' };
  }

  // --- AGENTE DE RE-CÁLCULO (Private) ---
  private async recalculateSolutions(
    content: any,
    model: string,
    subject: string,
  ) {
    if (!content?.questions?.length) return content;

    // 1. Detectar si es Ciencias (Matemática, Física, Química...)
    const cleanSubject = subject?.toLowerCase() || '';
    const isScience = [
      'matematica',
      'aritmetica',
      'algebra',
      'geometria',
      'trigonometria',
      'fisica',
      'quimica',
      'razonamiento matematico',
    ].some((s) => cleanSubject.toLowerCase().includes(s));

    let solverPromptTemplate = '';

    if (isScience) {
      // --- ESTRATEGIA A: CIENCIAS (Vertical, Pasos, LaTeX) ---
      // Ideal para niños de primaria: Poco texto, mucha estructura visual.
      solverPromptTemplate = `
        ROL: Ayudante de tareas de PRIMARIA experto en Matemáticas.
        OBJETIVO: Dar una solución CORTA, VERTICAL y VISUAL.
        
        REGLAS DE ORO (CIENCIAS):
        1. ❌ CERO TEXTO INNECESARIO. Prohibido saludar u "Hola", "Veamos", "Para resolver esto...".
        2. ❌ PROHIBIDO ESCRIBIR EL TEXTO "\\n" y "\" LITERALMENTE.
        3. ✅ USA SALTOS DE LÍNEA SIMPLES (ENTER) para separar los pasos.
        4. ✅ FORMATO PASO A PASO OBLIGATORIO (vertical):
           Paso 1: [Acción muy breve]
           $$ [Ecuación o Fórmula] $$
           
           Paso 2: [Acción muy breve]
           $$ [Cálculo] $$
           
           Resultado:
           $$ [Respuesta Final] $$
        4. 🛡️ MANEJO DE ERRORES: Si faltan datos en el gráfico, NO te quejes. Usa los números del enunciado y resuelve.
        5. Usa LaTeX ($...$) para todos los números y variables.
      `;
    } else {
      // --- ESTRATEGIA B: LETRAS (Narrativa, Directa, Sin LaTeX forzado) ---
      // Ideal para Historia, Lenguaje, Biología.
      solverPromptTemplate = `
        ROL: Profesor de Primaria amable y directo.
        OBJETIVO: Explicar el concepto o hecho en 2 o 3 frases sencillas.
        
        REGLAS DE ORO (LETRAS):
        1. ❌ CERO SALUDOS. Ve directo a la justificación.
        2. ✅ LENGUAJE SENCILLO: Usa palabras que un niño de 10 años entienda.
        3. 🚫 NO inventes "Pasos" ni "Ecuaciones" si no aplican.
        4. Justifica por qué la respuesta correcta es la verdadera basándote en hechos, reglas gramaticales o teoría.
        5. Ejemplo: "Cristóbal Colón llegó a América en 1492 financiado por los Reyes Católicos." (Directo y claro).
      `;
    }

    // Procesamos en paralelo (Promise.all) para velocidad
    const updatedQuestions = await Promise.all(
      content.questions.map(async (q, i) => {
        try {
          const enunciadoValidado =
            q.question_text || q.text || 'Pregunta matemática';
          // 1. Extraemos SOLO los datos visibles que tú editaste
          const visualData = q.graph_data?.elements
            ? q.graph_data.elements
                .filter(
                  (el) =>
                    (el.type === 'text' || el.type === 'angle') && el.text,
                )
                .map((el) => `${el.type}: ${el.text}`)
                .join(', ')
            : 'Sin datos gráficos';

          // 2. Prompt específico para resolver
          const solverPrompt = `
            ${solverPromptTemplate}
            
            ENTRADA:
            - Curso: ${subject}
            - Enunciado: "${enunciadoValidado}"
            - Datos Visuales: [ ${visualData} ]
            - Respuesta Correcta: "${q.correct_answer}"

            TAREA CRÍTICA:
            Genera un SOLUCIONARIO (Explicación de la respuesta) breve y didáctico.

            REGLA GENERAL:
            ❌ PROHIBIDO SALUDAR ("Hola", "Estimado alumno"). Ve directo al grano.
          `;

          // 3. Llamamos al nuevo método que creamos en el Paso 1
          const newSolution = await this.geminiService.generateText(
            solverPrompt,
            model,
          );

          console.log(`✅ Solución Q${i + 1} regenerada.`);
          return { ...q, solution_text: newSolution };
        } catch (e) {
          console.warn(`⚠️ Falló recálculo Q${i + 1}`, e);
          return q; // Si falla, mantenemos la original
        }
      }),
    );

    return { ...content, questions: updatedQuestions };
  }
}
