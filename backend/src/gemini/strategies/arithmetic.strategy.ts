import { ExamStrategy } from './exam-strategy.interface';
import {
  PROMPT_SYSTEM_BASE,
  PROMPT_ARITMETICA, // Tu prompt base de texto
  VISUAL_STYLE_GUIDE,
  PROMPT_GEO_SEGMENTOS, // Importamos el experto en segmentos
  PROMPT_GEO_AREAS, // Importamos áreas (por si acaso conjuntos/venn)
} from '../utils/gemini.prompts';

export class ArithmeticStrategy implements ExamStrategy {
  constructor(private topic: string) {}

  getSystemPrompt(): string {
    const t = this.topic.toLowerCase();

    // 1. CASO VISUAL: Temas de Aritmética que REQUIEREN gráfico
    // Ej: Segmentos (a veces se ve en aritmética básica), Conjuntos (Diagramas de Venn), Fracciones gráficas.
    if (t.includes('segmento') || t.includes('recta numerica')) {
      return `
        ${PROMPT_SYSTEM_BASE}
        MODO: ARITMÉTICA VISUAL (SEGMENTOS/RECTA).
        Tema: "${this.topic}".
        
        ${VISUAL_STYLE_GUIDE}
        ${PROMPT_GEO_SEGMENTOS} 

        REGLA DE ORO:
        - 60% Preguntas con GRÁFICO ("graph_data" válido).
        - 40% Preguntas de TEXTO ("graph_data": null).
      `;
    }

    if (t.includes('conjunto') || t.includes('venn')) {
      return `
        ${PROMPT_SYSTEM_BASE}
        MODO: ARITMÉTICA VISUAL (CONJUNTOS).
        Tema: "${this.topic}".
        ${VISUAL_STYLE_GUIDE}
        ${PROMPT_GEO_AREAS} 
        
        REGLA: Usa "circle" para dibujar Diagramas de Venn si es necesario.
       `;
    }

    // 2. CASO TEXTUAL: El resto de Aritmética (MCD, MCM, Primos, etc.)
    return `
      ${PROMPT_SYSTEM_BASE}
      ${PROMPT_ARITMETICA}
      
      REGLA:
      - "graph_data" DEBE SER null. (Salvo que necesites una tabla simple).
    `;
  }
}
