// src/ai/utils/prompts/common/visual.rules.ts

export const VISUAL_RULES = {
  // REGLA 1: Para Geometría Euclidiana (Triángulos, Polígonos) -> JSXGraph
  GEOMETRY_JSXGRAPH: `
    ESTRATEGIA VISUAL (GEOMETRÍA EUCLIDIANA):
    - Usa EXCLUSIVAMENTE el campo "graph_data".
    - Genera elementos: "elements": [{ "type": "point", ... }, { "type": "segment", "parents": ["A", "B"] }]
    - IMPORTANTE: Para segmentos, usa "parents": ["P1", "P2"], NO uses "point1" ni "point2".
  `,

  // REGLA 2: Para Conceptos Abstractos (Conjuntos, Intervalos, Rectas) -> SVG
  ABSTRACT_SVG: `
    ESTRATEGIA VISUAL (SVG VECTORIAL):
    - Usa EXCLUSIVAMENTE el campo "svgCode".
    - Genera código SVG limpio, sin estilos CSS externos.
    - Dimensiones ideales: viewBox="0 0 400 200".
    - Fondo transparente.
  `,

  // REGLA 3: Específica para INTERVALOS (Tu dolor de cabeza resuelto aquí)
  ALGEBRA_INTERVALS: `
    ESTRATEGIA PARA INTERVALOS / RECTA NUMÉRICA:
    - OBLIGATORIO: Usa el campo "svgCode".
    - NO USES "graph_data" para esto.
    - Dibuja una línea horizontal con flechas usando SVG <line> y <circle>.
    - Intervalo ABIERTO (<, >): Relleno BLANCO (fill="white", stroke="black").
    - Intervalo CERRADO (<=, >=): Relleno NEGRO (fill="black").
    - Ejemplo SVG: <svg viewBox="0 0 400 60"><line x1="10" y1="30" x2="390" y2="30" stroke="black" marker-end="url(#arrow)"/><circle cx="100" cy="30" r="5" fill="black"/></svg>
  `,
};
