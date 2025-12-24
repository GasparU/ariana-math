import { ExamStrategy } from './exam-strategy.interface';
import {
  PROMPT_ARITMETICA,
  PROMPT_ALGEBRA,
  PROMPT_RM,
} from '../utils/gemini.prompts'

export class TextOnlyStrategy implements ExamStrategy {
  constructor(private subject: string) {}

  getSystemPrompt(): string {
    let base = PROMPT_ARITMETICA;
    const s = this.subject.toLowerCase();

    if (s.includes('algebra')) base = PROMPT_ALGEBRA;
    else if (s.includes('rm') || s.includes('razonamiento')) base = PROMPT_RM;
    // Aquí puedes agregar Física, Química, Historia en el futuro

    return `
      ${base}
      ⛔ PROHIBIDO GENERAR GRÁFICOS: "graph_data" debe ser null siempre.
    `;
  }
}
