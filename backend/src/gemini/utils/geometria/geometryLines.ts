// =====================================================================
//  MÓDULO: RECTAS PARALELAS Y SECANTES (v4 - CALIBRACIÓN VISUAL)
// =====================================================================
export const LINES_RULES = `
### REGLAS DE COHERENCIA VISUAL (CRÍTICO):

1. **SELECCIÓN DE PUNTOS SEGÚN EL ÁNGULO:**
   - Si el problema pide un ángulo **AGUDO (< 90°)**: OBLIGATORIAMENTE usa los puntos que contengan "ACUTE".
   - Si el problema pide un ángulo **OBTUSO (> 90°)**: OBLIGATORIAMENTE usa los puntos que contengan "OBTUSE".
   - *Error común:* No pongas "120°" en un punto "ACUTE".

2. **ETIQUETAS:**
   - Usa "x", "y", "z" para incógnitas.
   - NO pongas el valor numérico de la respuesta en el gráfico.

### RECETARIO DE PLANTILLAS MAESTRAS:

#### PLANTILLA A: CLÁSICA (Secante Inclinada)
*Ideal para ángulos de 60°, 70°, 110°, 120°.*
- **Estructura:**
  - L1 (Arriba): Segmento [-4, 1.5] a [4, 1.5]. Flechas.
  - L2 (Abajo): Segmento [-4, -1.5] a [4, -1.5]. Flechas.
  - Secante: Segmento [-1.5, 3.5] a [1.5, -3.5]. (Pendiente pronunciada).
- **PUNTOS DE ANCLAJE (ÁNGULOS):**
  - Centro Arriba: **I_UP** [-0.65, 1.5]
  - Centro Abajo: **I_DOWN** [0.65, -1.5]
  
  - **REFERENCIAS PARA ÁNGULOS AGUDOS (<90):**
    - Arriba-Izq: ["SEC_TOP", "I_UP", "L1_LEFT"] -> **REF_ACUTE_UL**
    - Abajo-Der:  ["L2_RIGHT", "I_DOWN", "SEC_BTM"] -> **REF_ACUTE_DR**
  
  - **REFERENCIAS PARA ÁNGULOS OBTUSOS (>90):**
    - Arriba-Der: ["SEC_TOP", "I_UP", "L1_RIGHT"] -> **REF_OBTUSE_UR**
    - Abajo-Izq:  ["L2_LEFT", "I_DOWN", "SEC_BTM"] -> **REF_OBTUSE_DL**

#### PLANTILLA B: ZIG-ZAG (Afilado)
*Calibrado para ángulos de 40° a 80°.*
- **Estructura:**
  - L1: [-4, 2.5] a [4, 2.5].
  - L2: [-4, -2.5] a [4, -2.5].
  - **Camino (W Afilada):**
    - Inicio: [-2, 2.5]
    - Pico 1 (Agudo): [-0.5, 0]  <-- Este punto es clave
    - Fin: [2, 2.5]
- **ÁNGULOS:**
  - Ángulo en el Pico: Parents [Inicio, Pico1, Fin]. (Esto genera un ángulo agudo visualmente correcto).

---

### EJEMPLO JSON (Secante Clásica con Coherencia):
{
  "graph_data": {
    "boundingbox": [-5, 4, 5, -4],
    "showNavigation": false,
    "elements": [
      // LÍNEAS
      { "type": "segment", "parents": [[-4, 1.5], [4, 1.5]], "name": "L1", "label": { "position": "last", "offset": [10, 0] }, "firstArrow": true, "lastArrow": true, "color": "black" },
      { "type": "segment", "parents": [[-4, -1.5], [4, -1.5]], "name": "L2", "label": { "position": "last", "offset": [10, 0] }, "firstArrow": true, "lastArrow": true, "color": "black" },
      { "type": "segment", "parents": [[-1.5, 3.5], [1.5, -3.5]], "color": "black", "firstArrow": true, "lastArrow": true },

      // PUNTOS INVISIBLES DE REFERENCIA
      { "type": "point", "name": "I_UP", "coords": [-0.65, 1.5], "visible": false },
      { "type": "point", "name": "I_DOWN", "coords": [0.65, -1.5], "visible": false },
      { "type": "point", "name": "SEC_TOP", "coords": [-1.5, 3.5], "visible": false },
      { "type": "point", "name": "L1_LEFT", "coords": [-4, 1.5], "visible": false },
      { "type": "point", "name": "L1_RIGHT", "coords": [4, 1.5], "visible": false },

      // ÁNGULOS (Note el uso de referencias claras)
      // Agudo (45-80 grados):
      { "type": "angle", "parents": ["SEC_TOP", "I_UP", "L1_LEFT"], "text": "60°", "radius": 0.7, "fillColor": "none", "fillOpacity": 0, "color": "#36A2EB" },
      
      // Obtuso (100-150 grados):
      { "type": "angle", "parents": ["SEC_TOP", "I_UP", "L1_RIGHT"], "text": "x", "radius": 0.7, "fillColor": "none", "fillOpacity": 0, "color": "#FF6384" }
    ]
  }
}
`;
