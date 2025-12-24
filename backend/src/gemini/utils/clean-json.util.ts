import { jsonrepair } from 'jsonrepair';

export class CleanJsonUtil {
  static clean(rawInput: string): string {
    // 1. Detección de bucles (Si la respuesta es sospechosamente larga > 50kb, cortamos)
    if (rawInput.length > 50000) {
      console.warn('⚠️ Detectada respuesta inflada, intentando rescate...');
      // Buscamos el último cierre de array o llave antes de que se vuelva basura
      const lastValidIndex = Math.max(
        rawInput.lastIndexOf(']'),
        rawInput.lastIndexOf('}'),
      );
      rawInput = rawInput.substring(0, lastValidIndex + 1);
    }

    let text = rawInput
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // 2. ESTRATEGIA NUCLEAR REFINADA
    text = text.replace(/\\/g, '\\\\');
    text = text.replace(/\\\\"/g, '\\"');
    text = text.replace(/\\\\u([0-9a-fA-F]{4})/g, '\\u$1');

    try {
      return jsonrepair(text);
    } catch (e) {
      return text;
    }
  }
}
