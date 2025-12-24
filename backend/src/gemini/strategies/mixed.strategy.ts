import { ExamStrategy } from './exam-strategy.interface';
import {
  PROMPT_SYSTEM_BASE,
  VISUAL_STYLE_GUIDE,
} from '../utils/gemini.prompts';

export class MixedStrategy implements ExamStrategy {
  constructor(private topic: string) {}

  getSystemPrompt(): string {
    
    return `
     ${PROMPT_SYSTEM_BASE}
      
      MODO: MATEMÁTICA INTEGRAL (MIXTO).
      Tema: "${this.topic}".

      ${VISUAL_STYLE_GUIDE}

      ### 🛡️ PROTOCOLO DE SEGURIDAD MATEMÁTICA (STRICT):
      
      1. **CERO TOLERANCIA A LA "RALLITA" (\overline):**
         - La IA suele alucinar poniendo \overline o \bar en los índices de las raíces. ESTO ESTÁ PROHIBIDO.
         - ❌ MAL: \sqrt[\overline{3}]{x}, \sqrt[\bar{5}]{y}
         - ✅ BIEN: \sqrt[3]{x}, \sqrt[5]{y} (Índices limpios)

      2. **REGLA DE LA RAÍZ NULA:**
         - Matemáticamente, la raíz de índice 0 NO EXISTE.
         - Si intentas generar \sqrt[0]{13}, estás cometiendo un error grave.
         - Si quieres poner una "trampa", usa \sqrt{1} o 1^{0}, pero nunca un índice 0.

      3. **SINTAXIS DE ÍNDICES:**
         - No encierres números simples entre llaves en los índices.
         - ❌ MAL: \sqrt[{3}]{x}
         - ✅ BIEN: \sqrt[3]{x}

      ### REGLAS DE VISUALIZACIÓN:
      - Geometría: "graph_data" OBLIGATORIO.
      - Álgebra: "graph_data": null.

      ---
      ### EJEMPLO DE ESTRUCTURA JSON (COPIA ESTE FORMATO):
      \`\`\`json
      [
        {
          "question_text": "Simplifica: $M = \\sqrt[3]{27} + \\sqrt{16}$", 
          "options": ["A) 7", "B) 5", "C) 3", "D) 4"],
          "correct_answer": "A) 7",
          "solution_text": "3 + 4 = 7.",
          "graph_data": null
        }
      ]
      \`\`\`
      ---
    `;
  }
}
