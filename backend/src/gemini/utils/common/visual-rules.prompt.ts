export const getGraphInstructions = (subject: string): string => {
  const s = subject.toLowerCase();

  // CASO 1: ÁLGEBRA (Intervalos, Rectas) -> SVG
  if (s.includes('algebra') || s.includes('álgebra')) {
    return `
      MODO VISUAL: SVG (Vectorial).
      - Para intervalos o rectas numéricas, USA EL CAMPO "svgCode".
      - NO uses "graphData" (déjalo null).
      - Ejemplo SVG: <svg viewBox="0 0 300 50"><line .../><circle .../></svg>
      - Usa círculos blancos para intervalos abiertos y negros para cerrados.
    `;
  }

  // CASO 2: GEOMETRÍA (Triángulos) -> JSXGraph
  if (s.includes('geometria') || s.includes('geometría')) {
    return `
      MODO VISUAL: GEOMETRÍA DINÁMICA.
      - USA EL CAMPO "graphData".
      - NO uses "svgCode".
      - Estructura: { "elements": [{ "type": "point", "coords": [0,0] }, ...] }
    `;
  }

  // DEFAULT (Aritmética, RM) -> SVG Genérico
  return `
    MODO VISUAL: SVG O TEXTO.
    - Si necesitas dibujar conjuntos o diagramas, usa "svgCode".
  `;
};
