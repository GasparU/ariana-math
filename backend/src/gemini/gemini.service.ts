import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreateExamDto } from '../exam/dto/create-exam.dto';
import { RagService } from '../rag/rag.service';
import { GeometryStrategy } from './strategies/geometry.strategy';
import { MixedStrategy } from './strategies/mixed.strategy';
import { TextOnlyStrategy } from './strategies/text-only.strategy';
import { ArithmeticStrategy } from './strategies/arithmetic.strategy';
import { AlgebraStrategy } from './strategies/algebra.strategy';
import { ResponseParser } from './utils/gemini.service/response-parser.util';
import {
  getContextInstruction,
  getDifficultyPrompt,
} from './utils/gemini.prompts';
import { CleanJsonUtil } from './utils/clean-json.util';
import { getGraphInstructions } from './utils/common/visual-rules.prompt';

@Injectable()
export class GeminiService {
  private deepseekClient: OpenAI;
  private openaiClient: OpenAI;
  private geminiClient: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private ragService: RagService,
  ) {
    const deepseekKey = this.configService.get<string>('DEEPSEEK_API_KEY');
    this.deepseekClient = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: deepseekKey,
    });

    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openaiClient = new OpenAI({ apiKey: openaiKey });

    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!geminiKey) throw new Error('Falta GEMINI_API_KEY');
    this.geminiClient = new GoogleGenerativeAI(geminiKey);
  }

  async generateExam(dto: CreateExamDto): Promise<any> {
    const {
      subject,
      topic,
      difficulty,
      grade_level,
      context,
      num_questions,
      stage,
      aiModel,
      source,
    } = dto;

    // -------------------------------------------------------------
    // 1. SELECCIÓN DE ESTRATEGIA (CONSERVANDO TODO)
    // -------------------------------------------------------------
    let strategy: any;
    const cleanSubject = subject?.toLowerCase() || 'general';

    // ¡TUS IFS SIGUEN AQUÍ, NO SE HAN BORRADO!
    if (cleanSubject.includes('geometria')) {
      strategy = new GeometryStrategy(topic);
    } else if (cleanSubject === 'general' || cleanSubject.includes('mix')) {
      strategy = new MixedStrategy(topic || 'Examen General');
    } else if (cleanSubject.includes('aritmetica')) {
      strategy = new ArithmeticStrategy(topic);
    } else if (cleanSubject.includes('algebra')) {
      // 🔥 CAMBIO SOLID: Ya no preguntamos "if isVisual" aquí.
      // Simplemente llamamos a la estrategia. Ella sabe qué hacer.
      strategy = new AlgebraStrategy(topic);
    } else {
      // Caso Historia, Lenguaje, etc.
      strategy = new TextOnlyStrategy(cleanSubject);
    }

    // -------------------------------------------------------------
    // 2. OBTENER REGLAS VISUALES (DINÁMICO)
    // -------------------------------------------------------------
    let visualInstruction = '';

    // Preguntamos: "¿Señor Estrategia, usted tiene reglas visuales especiales?"
    // Si es AlgebraStrategy, responderá con lo que definimos en el archivo anterior.
    // Si es TextOnlyStrategy (Historia), no tendrá este método y pasará al else.
    if (strategy && typeof strategy['getVisualRules'] === 'function') {
      visualInstruction = strategy.getVisualRules();
    } else {
      // Regla por defecto (30% gráficos) para Geometría, Aritmética, etc.
      visualInstruction = getGraphInstructions(subject || 'general');
    }

    const systemPrompt = strategy.getSystemPrompt();
    let ragContext = '';

    // 3. RAG (Búsqueda de contexto - SE MANTIENE IGUAL)
    const ragFilter: any = {};
    if (grade_level) ragFilter.grade = grade_level;
    if (subject) ragFilter.subject = subject;
    if (source && source !== 'any') ragFilter.source = source;

    const shouldActivateRag =
      difficulty === 'hard' ||
      difficulty === 'mixed' ||
      difficulty === 'olympic' ||
      (source && source !== 'any') ||
      stage ||
      topic.toLowerCase().includes('conamat');

    if (shouldActivateRag) {
      try {
        console.log(`🔍 RAG Buscando: "${topic}"...`);
        ragContext = await this.ragService.searchSimilar(topic, ragFilter);
        if (!ragContext) console.log('⚠️ RAG sin coincidencias.');
      } catch (e) {
        console.warn('⚠️ Error RAG:', e.message);
      }
    }

    // 4. ARMADO DEL PROMPT DE USUARIO
    const userPrompt = `
      ROL: ERES UN AUTOR DE EXÁMENES MATEMÁTICOS EXPERTO.
      TAREA: INVENTAR un examen nuevo desde cero.
      
      OBJETIVO: Generar un examen de ${num_questions} preguntas Originales.
      MATERIA: ${subject}. TEMA: ${topic}. 
      🚨 REGLA DE GRADO: La dificultad debe ser estrictamente para 6TO DE PRIMARIA. 
      NIVEL SOLICITADO: ${difficulty} (Basico, Intermedio, Avanzado o Mixed).

      ${difficulty === 'mixed' ? 'INSTRUCCIÓN MIXED: 30% Básico, 40% Intermedio, 30% Avanzado.' : ''}
      
      ${getContextInstruction(context || '')}
      ${getDifficultyPrompt(difficulty)}
      
      ${visualInstruction}

      🚨 REGLA DE ORO "ANTI-QUEJAS":
      - TÚ ERES EL CREADOR. NO analices si falta información en este prompt.
      - SI FALTAN DATOS (funciones, números, gráficos), ¡INVÉNTALOS!
      - NUNCA respondas "Faltan datos" o "No puedo resolverlo".
      - NUNCA digas "undefined".

      🚨 REGLAS CRÍTICAS DE DIBUJO (SVG - ESTILO LIBRO):
      1. **ESTILO PUENTE:** Dibuja el intervalo "flotando" en Y=30, conectado a la base en Y=60.
      2. **COLORES:** Usa 'url(#hatchBlue)' (Azul) por defecto.
      3. **BOLITAS:** Blanco ('white') para abierto, Negro ('black') para cerrado.
      4. **FONDO:** Usa coordenadas absolutas (0 a 400).
      5. NO incluyas tu proceso de pensamiento, borradores, ni correcciones en el texto. Escribe SOLO la versión final de la pregunta y la solución.

      🚨 REGLAS MATEMÁTICAS:
      - **LATEX OBLIGATORIO:** Toda matemática entre signos de dólar ($...$).
      - ❌ PROHIBIDO usar la palabra "infty".
      - ✅ OBLIGATORIO usar el código "\\infty".

      🚨 REGLAS PARA LAS OPCIONES (DISTRACTORES):
      1. DEBE haber EXACTAMENTE 5 opciones por pregunta.
      2. Las opciones deben ser ÚNICAS. Está PROHIBIDO repetir el mismo texto.
      3. Si el resultado es "16", los distractores NO pueden ser "16" otra vez.

      1. PROHIBIDO dar discursos, introducciones o teorías complejas.
      2. FORMATO OBLIGATORIO (Vertical y Paso a Paso):
         Paso 1: [Acción breve]
         $$ [Fórmula o número] $$
         Paso 2: [Acción breve]
         $$ [Cálculo] $$
         Resultado: [Respuesta final]
      3. LENGUAJE: Sencillo, para un niño de 10 años. (Ej: "Pasamos a restar", "Sumamos").
      4. SI EL PROBLEMA ES SENCILLO, usa solo 2 pasos.

      🚨 FORMATO JSON DE RESPUESTA (ESTRICTO):
      {
        "questions": [
          {
            "questionNumber": 1,
            "question": "Enunciado claro e inventado por ti",
            "hasGraph": true,
            "graphType": "svg",
            "svgCode": "...",
            "answerOptions": [
              { "text": "Opción A (ÚNICA)", "isCorrect": false },
               { "text": "Opción B (ÚNICA)", "isCorrect": true },
               { "text": "Opción C (ÚNICA)", "isCorrect": false },
               { "text": "Opción D (ÚNICA)", "isCorrect": false },
               { "text": "Opción E (ÚNICA)", "isCorrect": false }
            ],
            "solution_text": "Resolución matemática paso a paso. SIN SALUDOS."
          }
        ]
      }

      CONTEXTO RAG:
      ${ragContext}
    `;

    // 5. EJECUCIÓN IA (SE MANTIENE IGUAL)
    let rawJson = '';
    try {
      const creativeTemp = 0.1;

      if (aiModel && aiModel.toLowerCase().includes('gemini')) {
        console.log(`⚡ Ejecutando Gemini (${aiModel || 'default'})...`);
        const targetModel = aiModel.toLowerCase().includes('pro')
          ? 'gemini-2.0-flash-exp'
          : 'gemini-2.5-flash';

        const model = this.geminiClient.getGenerativeModel({
          model: targetModel,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: creativeTemp,
            responseMimeType: 'application/json',
          },
        });
        const result = await model.generateContent(userPrompt);
        rawJson = result.response.text();
      } else {
        // OpenAI / DeepSeek
        let client: OpenAI;
        let targetModel: string;
        if (aiModel && aiModel.toLowerCase().includes('gpt')) {
          client = this.openaiClient;
          targetModel = 'gpt-4o';
        } else {
          client = this.deepseekClient;
          targetModel = 'deepseek-chat';
        }
        const completion = await client.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: targetModel,
          temperature: creativeTemp,
        });
        rawJson = completion.choices[0].message.content || '';
      }

      // 6. LIMPIEZA Y PARSEO
      const fixedJson = CleanJsonUtil.clean(rawJson);
      console.log('🤖 IA RAW JSON:', fixedJson.substring(0, 100) + '...');

      let parsed: any;
      try {
        parsed = JSON.parse(fixedJson);
      } catch (parseError) {
        console.error('❌ JSON FATAL ERROR. Raw:', rawJson);
        throw new InternalServerErrorException(
          'La IA generó un formato irrecuperable.',
        );
      }

      if (parsed && parsed.questions && Array.isArray(parsed.questions)) {
        parsed.questions = parsed.questions.map((q) => {
          const foundOptions =
            q.answerOptions || q.options || q.alternatives || q.question;
          if (Array.isArray(foundOptions)) {
            q.answerOptions = foundOptions;
            q.options = foundOptions;
          }
          return q;
        });
      }

      const finalQuestions = ResponseParser.parseExamResponse(parsed, {
        subject,
        topic,
      });

      finalQuestions.forEach((q, i) => {
        const rawQ = parsed.questions ? parsed.questions[i] : null;
        if (rawQ) {
          if (!q.svgCode && rawQ.svgCode) q.svgCode = rawQ.svgCode;
          if (!q.graph_data && rawQ.graph_data) q.graph_data = rawQ.graph_data;

          const rawOptions =
            rawQ.answerOptions ||
            rawQ.options ||
            rawQ.alternatives ||
            rawQ.question;

          if (Array.isArray(rawOptions) && rawOptions.length > 0) {
            const safeOptions = rawOptions.slice(0, 5);
            q.options = safeOptions;
            q.answerOptions = safeOptions;
          }
        }
      });

      return { questions: finalQuestions };
    } catch (error) {
      console.error('--- ERROR GENERANDO EXAMEN ---', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  async generateText(prompt: string, aiModel: string): Promise<string> {
    try {
      if (aiModel && aiModel.toLowerCase().includes('gemini')) {
        const targetModel = aiModel.toLowerCase().includes('pro')
          ? 'gemini-2.0-flash-exp'
          : 'gemini-2.5-flash';
        const model = this.geminiClient.getGenerativeModel({
          model: targetModel,
        });
        const result = await model.generateContent(prompt);
        return result.response.text();
      }

      let client = this.openaiClient;
      let target = 'gpt-4o';
      if (!aiModel.includes('gpt')) {
        client = this.deepseekClient;
        target = 'deepseek-chat';
      }

      const res = await client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: target,
      });
      return res.choices[0].message.content || '';
    } catch (e) {
      return 'Error IA';
    }
  }
}
