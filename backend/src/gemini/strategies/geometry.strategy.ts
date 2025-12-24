import { ExamStrategy } from './exam-strategy.interface';
import {
  PROMPT_GEO_AREAS,
  PROMPT_SYSTEM_BASE,
  VISUAL_STYLE_GUIDE,
} from '../utils/gemini.prompts';

import { CARTESIAN_RULES } from '../utils/geometria/geometryCartesian'; // Analítica
import { LINES_RULES } from '../utils/geometria/geometryLines';
import { BASIC_ANGLE_RULES } from '../utils/geometria/geometryBasicAngles';

export class GeometryStrategy implements ExamStrategy {
  constructor(private topic: string) {}

  getSystemPrompt(): string {
    const t = this.topic.toLowerCase();
    let specificRules = '';

    if (t.includes('segmento') || t.includes('linea') || t.includes('colineal')) {
      specificRules = LINES_RULES || 'Tema: Segmentos. Dibuja líneas con puntos.';
    } else if (t.includes('angulo') || t.includes('bisectriz')) {
      specificRules = BASIC_ANGLE_RULES || 'Tema: Ángulos. Dibuja rayos y arcos.';
    } else if (t.includes('triangulo') || t.includes('pitagoras')) {
      // Si tienes TRIANGLE_RULES úsalo, sino usa un genérico
      specificRules = 'Tema: Triángulos. Dibuja polígonos de 3 vértices.'; 
    } else if (t.includes('plano') || t.includes('coordenada') || t.includes('pendiente')) {
      specificRules = CARTESIAN_RULES;
    } else if (t.includes('area') || t.includes('sombread')) {specificRules = PROMPT_GEO_AREAS

    } 
    
    return `
      ${PROMPT_SYSTEM_BASE}
      
      MODO: GEOMETRÍA VISUAL (EXPERTO EN JSXGRAPH).
      TEMA ESPECÍFICO: "${this.topic}".

      ${VISUAL_STYLE_GUIDE}

      ### 📐 REGLAS ESPECÍFICAS DEL TEMA:
      ${specificRules}

      ### 🛡️ PROTOCOLO ANTI-CORTE (AHORRO DE TOKENS):
      1. **EXPLICACIONES ULTRA-BREVES:** En "solution_text", sé directo. "Por teorema de Tales: 5/x = 10/4 -> x=2". No escribas párrafos de texto.
      2. **PRIORIDAD AL GRÁFICO:** Gasta tus tokens en generar un "graph_data" perfecto.
      3. **LATEX COMPACTO:** Usa notación simple.

      ### 🎨 REGLA DE ORO DE VISUALIZACIÓN (OBLIGATORIA):

      ### 📐 REGLAS ESPECÍFICAS DEL TEMA:
      ${specificRules}

      ### 🎨 REGLA DE ORO DE VISUALIZACIÓN (OBLIGATORIA):
      1. **SIEMPRE GENERA "graph_data":** - Para temas de "Segmentos", "Ángulos", "Triángulos" o "Polígonos", es **PROHIBIDO** devolver "graph_data": null.
         - Incluso si el problema es simple (ej: "AB=2, BC=2, halla AC"), **DEBES** generar el código JSON para dibujar la línea.
         - Si no hay gráfico, el usuario no puede visualizar el problema.

      2. **ESTILO DE SEGMENTOS:**
         - Usa puntos grandes y etiquetas visibles.
         - Si dice "A, B, C son colineales", dibuja una sola línea horizontal con 3 puntos.

      ---
      ### EJEMPLO DE RESPUESTA JSON (GEOMETRÍA):
      \`\`\`json
      [
        {
          "question_text": "Sobre una recta se ubican los puntos A, B y C...",
          "options": ["A) 5", "B) 10", "C) 15", "D) 20"],
          "correct_answer": "A) 5",
          "solution_text": "AB + BC = ...",
          "graph_data": { 
             "elements": [ 
                {"type": "point", "name": "A", "x": 0, "y": 0}, 
                {"type": "point", "name": "B", "x": 5, "y": 0} 
             ] 
          }
        }
      ]
      \`\`\`
      ---
    `;
  }
  
}
