

export const SEGMENT_CORE = `
### REGLAS DE DIBUJO TÉCNICO (CRÍTICO - VISUALIZACIÓN):
1. **NORMALIZACIÓN VISUAL (REGLA DE ORO):**
   - El lienzo visual va de **X = -6 a X = 6** (Ancho total = 12 unidades).
   - **NO USES LAS COORDENADAS DEL PROBLEMA.** (Si el problema dice X=100, no dibujes en 100).
   - **REGLA DE TRES VISUAL:**
     1. Asigna al segmento TOTAL más largo las coordenadas visuales **[-5, 5]**.
     2. Calcula la posición proporcional de los puntos intermedios.
     *Ejemplo:* Si AC = 20 (Total) y AB = 5 (25%):
       - A Visual = -5
       - C Visual = 5
       - B Visual = -2.5 (Porque -5 + 2.5 es el 25% del recorrido).

2. **ALINEACIÓN VERTICAL ESTRICTA:**
   - Las líneas punteadas (cotas) deben empezar y terminar **EXACTAMENTE** en las mismas coordenadas X que los puntos naranjas.
   - Si el punto A está en X = -5, el tope de la cota debe estar en X = -5.

3. **COORDENADAS Y (ALTURAS):** - **PUNTOS (Naranjas):** SIEMPRE en **Y = 0**.
    - **COTA SUPERIOR (Arriba):** Línea en **Y = 0.8**. Texto en Y = 1.0.
    - **COTA INFERIOR (Abajo):** Línea en **Y = -1.5**. Texto en Y = -1.7.

4. **ESTILOS Y COLORES:**
   - **Puntos:** "#FF9F40" (Naranja), Size: 4. Etiquetas mayúsculas.
   - **Línea Base:** "black" (Negro).
   - **Cotas (Medidas):**
     - Si es INCÓGNITA ("x"): Color "#FF6384" (Rosado).
     - Si es DATO NUMÉRICO: Color "#666666" (Gris).
   - **Texto:** SIEMPRE "black" (Negro puro).
   - **Incógnita:** Si piden hallar un valor, la etiqueta debe ser "x", NUNCA el valor resuelto.

### EJEMPLO JSON SEGMENTOS (ESTRICTO):
Usa esta estructura EXACTA. Nota cómo las coordenadas X de las cotas coinciden con los puntos.

{
  "graph_data": {
    "elements": [
      // 1. PUNTOS Y LÍNEA BASE (Y=0)
      { "type": "point", "name": "A", "coords": [-5, 0], "label": "A", "color": "#FF9F40" },
      { "type": "point", "name": "B", "coords": [5, 0], "label": "B", "color": "#FF9F40" },
      { "type": "segment", "parents": ["A", "B"], "color": "black" },

      // 2. COTA SUPERIOR (Y=0.8) - Mide todo el segmento
      { "type": "segment", "parents": [[-5, 0.8], [5, 0.8]], "color": "#666666" }, 
      { "type": "segment", "parents": [[-5, 0.7], [-5, 0.9]], "color": "#666666" }, // Tope A
      { "type": "segment", "parents": [[5, 0.7], [5, 0.9]], "color": "#666666" },   // Tope B
      { "type": "text", "coords": [0, 1.0], "text": "20 cm", "color": "black", "fontSize": 16 },

      // 3. COTA INFERIOR (Y=-1.5) - Mide una parte (ej: punto medio M en 0)
      { "type": "segment", "parents": [[-5, -1.5], [0, -1.5]], "color": "#FF6384" },
      { "type": "segment", "parents": [[-5, -1.4], [-5, -1.6]], "color": "#FF6384" }, // Tope A
      { "type": "segment", "parents": [[0, -1.4], [0, -1.6]], "color": "#FF6384" },   // Tope M
      { "type": "text", "coords": [-2.5, -1.7], "text": "x", "color": "black", "fontSize": 16 }
    ]
  }
}
`;
