import { Injectable } from '@nestjs/common';

@Injectable()
export class ResponseParser {
  // CORRECCIÓN: Aceptamos string o cualquier objeto ya parseado
  static parseExamResponse(
    input: string | any,
    context: { subject?: string; topic?: string } = {},
  ): any[] {
    try {
      let parsed;

      // 1. SI YA ES UN OBJETO, LO USAMOS DIRECTO (Evitamos doble parseo)
      if (typeof input === 'object' && input !== null) {
        parsed = input;
      }
      // 2. SI ES STRING, APLICAMOS LIMPIEZA Y PARSEO
      else {
        let cleanJson = String(input)
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();

        // Regex de emergencia solo si recibimos texto crudo
        cleanJson = cleanJson.replace(/\\(?![/u"bfnrt\\])/g, '\\\\');
        parsed = JSON.parse(cleanJson);
      }

      // 3. Búsqueda inteligente de preguntas
      let questionsArray: any[] = [];
      if (Array.isArray(parsed)) {
        questionsArray = parsed;
      } else if (parsed.preguntas && Array.isArray(parsed.preguntas)) {
        questionsArray = parsed.preguntas;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questionsArray = parsed.questions;
      } else if (
        parsed.examen &&
        parsed.examen.preguntas &&
        Array.isArray(parsed.examen.preguntas)
      ) {
        questionsArray = parsed.examen.preguntas;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        questionsArray = parsed.data;
      } else {
        const values = Object.values(parsed);
        const foundArray = values.find((v) => Array.isArray(v) && v.length > 0);
        if (foundArray) questionsArray = foundArray as any[];
      }

      if (!questionsArray || questionsArray.length === 0) {
        // Fallback: Si no hay array, quizás el objeto en sí es la pregunta
        if (parsed.question_text || parsed.pregunta) {
          questionsArray = [parsed];
        } else {
          throw new Error(
            'No se encontraron preguntas válidas en la respuesta.',
          );
        }
      }

      // =================================================================
      // 🚨 ZONA DE SANITIZACIÓN DE CONTENIDO (Latex, Texto)
      // =================================================================
      const cleanLatex = (str: string) => {
        if (!str) return '';
        let s = String(str);

        // 1. Limpieza Unicode
        s = s.normalize('NFD').replace(/[\u0300-\u036f\u203e\u00af]/g, '');

        // 2. LIMPIEZA DE ARTEFACTOS VISUALES (El cambio clave)
        s = s.replace(/\\\\([a-zA-Z]\))/g, '$1');
        s = s.replace(/\\\\([\[\]])/g, '$1');

        // 3. REGLA DEL MONODÍGITO (Tu regla de oro):
        // Borra la barra si solo cubre un caracter (ej: \overline{3} -> 3)
        s = s.replace(/\\(overline|bar){([a-zA-Z0-9])}/g, '$2');
        s = s.replace(/\\\\(overline|bar){([a-zA-Z0-9])}/g, '$2');

        // 4. NORMALIZACIÓN LATEX
        s = s.replace(/\\\\/g, '\\');

        // 5. RECONSTRUCCIÓN DE RAÍCES
        s = s.replace(/\\sqrt\[(.*?)\]/g, (_match, contenidoIndice) => {
          const indiceLimpio = contenidoIndice.replace(/[^0-9a-zA-Z]/g, '');
          if (!indiceLimpio || indiceLimpio === '0' || indiceLimpio === '1') {
            return '\\sqrt';
          }
          return `\\sqrt[${indiceLimpio}]`;
        });


        s = s.trim();
        if (s.endsWith('.')) s = s.slice(0, -1);

        return s;
      };

      return questionsArray.map((q, index) => {
        // Normalización de campos
        const rawText =
          q.question_text ||
          q.question ||
          q.enunciado ||
          q.pregunta ||
          q.text ||
          'Sin enunciado';

        // Manejo de Opciones
        let normalizedOptions: string[] = [];
        if (Array.isArray(q.options)) {
          normalizedOptions = q.options;
        } else if (q.options && typeof q.options === 'object') {
          normalizedOptions = Object.entries(q.options).map(
            ([k, v]) => `${k}) ${v}`,
          );
        }

        normalizedOptions = normalizedOptions.map((opt) => cleanLatex(opt));

        let correct =
          q.correct_answer || q.correctAnswer || q.respuesta_correcta || '';
        correct = cleanLatex(correct);

        // Si la respuesta es solo "A" y las opciones son "A) ...", buscamos el match
        if (correct.length === 1 && normalizedOptions.length > 0) {
          const match = normalizedOptions.find(
            (opt) => opt.startsWith(correct) || opt.startsWith(`${correct})`),
          );
          if (match) correct = match;
        }

        return {
          id: index + 1,
          question_text: cleanLatex(rawText),
          options: normalizedOptions,
          correct_answer: correct,
          solution_text: cleanLatex(
            q.solution_text || q.explanation || 'Solución automática.',
          ),
          difficulty: q.difficulty || 'medium',
          graph_data: q.graph_data || null,
        };
      });
    } catch (error) {
      console.error('❌ Error procesando respuesta:', error.message);
      // Lanzamos error genérico para que el frontend lo muestre limpio
      throw new Error('Error de formato en la respuesta IA.');
    }
  }
}
