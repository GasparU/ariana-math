// =====================================================================
//  MÓDULO: ÁNGULOS BÁSICOS (Rayos y Puntos)
// =====================================================================
export const BASIC_ANGLE_RULES = `
### REGLAS PARA ÁNGULOS BÁSICOS (COMPLEMENTARIOS / SUPLEMENTARIOS):

1. **GEOMETRÍA DE RAYOS:**
   - Todo nace de un centro "O" en (0,0).
   - Usa "segment" o "line" con "lastArrow": true para simular rayos.

2. **ÁNGULOS ESPECIALES:**
   - **Recto (90°):** Dibuja un CUADRADITO en el vértice, no un arco.
   - **Llano (180°):** Una línea recta horizontal.
   - **Vuelta (360°):** Un círculo completo alrededor del centro.

3. **ESTÉTICA:**
   - Relleno de ángulos: "fillColor": "none" (Transparente).
   - Borde de ángulos: "strokeWidth": 2.
   - Etiquetas: Deben estar LEJOS del vértice (radius * 1.5).

4. **EJEMPLO JSON (Ángulo Complementario):**
{
  "graph_data": {
    "boundingbox": [-2, 5, 5, -2],
    "elements": [
      { "type": "point", "name": "O", "coords": [0, 0], "label": "O", "fixed": true },
      { "type": "point", "name": "A", "coords": [4, 0], "visible": false },
      { "type": "point", "name": "B", "coords": [0, 4], "visible": false },
      { "type": "point", "name": "C", "coords": [3, 2], "visible": false }, // Rayo intermedio
      // Rayos
      { "type": "segment", "parents": ["O", "A"], "lastArrow": true },
      { "type": "segment", "parents": ["O", "B"], "lastArrow": true },
      { "type": "segment", "parents": ["O", "C"], "lastArrow": true },
      // Cuadradito de 90 grados (Auxiliar)
      { "type": "polygon", "parents": [[0,0], [0.5,0], [0.5,0.5], [0,0.5]], "fillColor": "#36A2EB", "fillOpacity": 0.3 },
      // Ángulos
      { "type": "angle", "parents": ["A", "O", "C"], "text": "x", "radius": 1.5, "fillColor": "none" },
      { "type": "angle", "parents": ["C", "O", "B"], "text": "30°", "radius": 1.2, "fillColor": "none" }
    ]
  }
}
`;
