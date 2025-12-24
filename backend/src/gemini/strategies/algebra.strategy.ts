import { ExamStrategy } from './exam-strategy.interface';
import {
  PROMPT_SYSTEM_BASE,
  PROMPT_ALGEBRA, // El prompt de texto (seguro)
} from '../utils/gemini.prompts';

export class AlgebraStrategy implements ExamStrategy {
  constructor(private topic: string) {}

  getSystemPrompt(): string {
    return `${PROMPT_SYSTEM_BASE}\n${PROMPT_ALGEBRA}\nERES UN EXPERTO EN ÁLGEBRA.`;
  }

  getVisualRules(): string {
    const t = this.topic.toLowerCase();

    const visualKeywords = [
      'funcion',
      'grafica',
      'plano',
      'cartesiano',
      'pendiente',
      'recta',
      'parabola',
      'lugar geometrico',
      'intervalo',
      'inecuacion',
      'region',
      'area',
      'rango',
      'dominio',
      'desigualdad',
      'recta numerica',
      'grafic',
      'complemento'
    ];

    const isVisual = visualKeywords.some((keyword) => t.includes(keyword));

    if (!isVisual) {
      
      return `
        🚨 REGLA VISUAL ESTRICTA (MODO TEXTO - ÁLGEBRA):
        - TEMA: "${this.topic}" -> DETECTADO COMO NO VISUAL.
        - ESTÁ PROHIBIDO GENERAR GRÁFICOS SVG.
        - "hasGraph": false (SIEMPRE)
        - "graphType": "none" (SIEMPRE)
        - "svgCode": null (SIEMPRE)
      `;
    }

    // CASO 2: Intervalos -> OBLIGATORIO DIBUJAR
   return `
      MODO ACTIVADO: ÁLGEBRA VISUAL.
      TEMA: "${this.topic}".
      
      🚨 REGLA DE DISTRIBUCIÓN VISUAL (OBLIGATORIO):
      - Al menos el 30% de las preguntas DEBEN INCLUIR UN GRÁFICO SVG.
      - "hasGraph": true, "graphType": "svg".

      🚨 REGLA DE ORO PARA LOS PUNTOS (BOLITAS) - ¡CRÍTICO!:
      Debes mirar estrictamente el signo de agrupación del resultado final:
      
      1. **BOLITA BLANCA (HUECA):** - Úsala SIEMPRE que veas paréntesis: '(', ')' o signos '<', '>'.
         - CÓDIGO SVG: <circle cx="..." cy="30" r="5" fill="white" stroke="black" stroke-width="2" />
         - EJEMPLO: Si la respuesta es (-∞, -1), el -1 lleva BOLITA BLANCA.
         - Si es un Intervalo (ej: (2, 5)), dibuja la recta con los puntos abiertos.

      2. **BOLITA NEGRA (RELLENA):**
         - Úsala SIEMPRE que veas corchetes: '[', ']' o signos '≤', '≥'.
         - CÓDIGO SVG: <circle cx="..." cy="30" r="5" fill="black" stroke="none" />
         - EJEMPLO: Si la respuesta es [4, +∞), el 4 lleva BOLITA NEGRA.

      3. **EN COMPLEMENTOS:**
         - Si el conjunto original era CERRADO [-1], su complemento es ABIERTO (-1). ¡DIBUJA EL COMPLEMENTO (BLANCO)!
    `;
  }
}


// if (!isVisual) {
      
//       return `
//       REGLA VISUAL ESTRICTA (MODO TEXTO - ÁLGEBRA):
//       ${PROMPT_SYSTEM_BASE}
//       ${PROMPT_ALGEBRA_VISUAL}

//       TEMA: "${this.topic}".
//         🚨 REGLA VISUAL ESTRICTA (MODO TEXTO - ÁLGEBRA):
//         - ESTÁ PROHIBIDO GENERAR GRÁFICOS SVG para este tema (${this.topic}).
//         - "hasGraph": false (SIEMPRE)
//         - "graphType": "none" (SIEMPRE)
//         - "svgCode": null (SIEMPRE)
//         - Concéntrate exclusivamente en las fórmulas LaTeX complejas.
//         REGLA CRÍTICA:
//         - Usa LaTeX limpio con doble barra (\\\\).
//         - Genera las coordenadas y elementos necesarios para que JSXGraph dibuje la recta o función.
//         - Para este tema, NO devuelvas "graph_data": null.
//       `;
//     }

//     // CASO 2: Intervalos -> OBLIGATORIO DIBUJAR
//     return `
//      ${PROMPT_SYSTEM_BASE}
//       ${PROMPT_ALGEBRA}
//       MODO ACTIVADO: ÁLGEBRA VISUAL.
//       TEMA: "${this.topic}".
//       🚨 REGLA DE DISTRIBUCIÓN VISUAL (ÁLGEBRA - INTERVALOS):
//       - Al menos el 30% de las preguntas DEBEN INCLUIR UN GRÁFICO SVG (Recta Numérica).
//       - REGLAS DE DIBUJO: Estilo puente en Y=30, bolitas blancas (abierto)/negras (cerrado), trama 'url(#hatchBlue)'.
//       - Para este tema (Intervalos, Inecuaciones, Gráficas), el campo "graph_data" es OBLIGATORIO.
//       - NO devuelvas "graph_data": null. Debes dibujar la recta numérica o el plano.
//       - Si es un Intervalo (ej: [2, 5>), dibuja la recta con los puntos abiertos/cerrados correctos.
//       - Usa JSXGraph.
//     `;
//   }