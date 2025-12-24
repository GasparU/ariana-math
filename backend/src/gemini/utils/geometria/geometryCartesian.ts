// =====================================================================
//  MÓDULO: PLANO CARTESIANO Y TRANSFORMACIONES
// =====================================================================
export const CARTESIAN_RULES = `
### REGLAS PARA PLANO CARTESIANO Y TRANSFORMACIONES:

1. **CONFIGURACIÓN DEL TABLERO (MANDATORIO):**
   - Debes configurar el tablero JSXGraph con ejes visibles y cuadrícula.
   - Configuración: "axis": true, "grid": true, "showNavigation": false.
   - Rango visual sugerido: boundingbox: [-6, 10, 10, -6] (ajustar según coordenadas).

2. **REPRESENTACIÓN DE PUNTOS (PARES ORDENADOS):**
   - Cada punto debe tener su etiqueta visible si el problema lo requiere (ej: "A(2,3)").
   - Usa "size": 3, "color": "#36A2EB" (Azul).

3. **TRANSFORMACIONES GEOMÉTRICAS:**
   **A. TRASLACIÓN:**
     - Dibuja la figura ORIGINAL (fillColor: "none" o gris claro).
     - Dibuja el VECTOR de traslación (flecha) si se pide.
     - Dibuja la figura FINAL (fillColor: "#FFCE56" o color vivo).
     - Las coordenadas se suman: P'(x+dx, y+dy).

   **B. SIMETRÍA (REFLEXIÓN):**
     - Dibuja el EJE DE SIMETRÍA (Línea roja punteada).
     - Dibuja líneas punteadas finas conectando cada punto original con su reflejo (perpendiculares al eje).

   **C. AMPLIACIÓN/REDUCCIÓN:**
     - Dibuja ambas figuras (la pequeña y la grande) centradas o proyectadas desde un punto.

4. **EJEMPLO JSON (Triángulo en el plano):**
{
  "graph_data": {
    "axis": true,
    "grid": true,
    "boundingbox": [-2, 8, 8, -2],
    "elements": [
      { "type": "point", "name": "A", "coords": [1, 1], "label": "A(1,1)", "color": "#36A2EB" },
      { "type": "point", "name": "B", "coords": [4, 1], "label": "B(4,1)", "color": "#36A2EB" },
      { "type": "point", "name": "C", "coords": [1, 5], "label": "C(1,5)", "color": "#36A2EB" },
      { "type": "polygon", "parents": ["A", "B", "C"], "fillColor": "#36A2EB", "fillOpacity": 0.3 }
    ]
  }
}
`;
