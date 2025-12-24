// =====================================================================
//  MÓDULO: SÓLIDOS GEOMÉTRICOS (Falso 3D / Isometría)
// =====================================================================
export const SOLID_RULES = `
### REGLAS PARA SÓLIDOS GEOMÉTRICOS (3D EN 2D):

⚠️ **RETO:** JSXGraph es 2D. Debes dibujar proyecciones (Caballera o Isométrica).

1. **LÓGICA DE VISIBILIDAD (Líneas Ocultas):**
   - Las aristas que estarían "atrás" o "dentro" del sólido deben ser PUNTEADAS.
   - Usa la propiedad: "dash": 2 (para líneas punteadas).
   - Usa "color": "black" o gris oscuro.

2. **CONSTRUCCIÓN DE FIGURAS CLAVE:**

   **A. CUBO / PRISMA RECTO:**
     - Dibuja un rectángulo frontal (A,B,C,D).
     - Dibuja un rectángulo trasero desplazado (A',B',C',D') (ej: desplazado x+1, y+1).
     - Une los vértices correspondientes (A-A', B-B', etc.).
     - **IMPORTANTE:** Las líneas del rectángulo trasero y las conexiones inferiores suelen ser punteadas.

   **B. CILINDRO:**
     - Dibuja dos elipses idénticas (una arriba, una abajo).
     - Une los extremos laterales con dos líneas verticales tangentes.
     - La mitad inferior de la elipse de la base debe ser punteada ("dash": 2).

   **C. PIRÁMIDE / CONO:**
     - Dibuja la base (cuadrado en perspectiva o elipse).
     - Define un punto "Vértice" muy arriba en el centro.
     - Une los puntos de la base con el vértice.

3. **RELLENOS:**
   - Usa "fillOpacity": 0.1 (muy transparente) para que se vean las líneas de atrás.

4. **EJEMPLO JSON (Cubo):**
{
  "graph_data": {
    "elements": [
      // Cara Frontal (Visible)
      { "type": "point", "name": "A", "coords": [0, 0], "visible": false },
      { "type": "point", "name": "B", "coords": [4, 0], "visible": false },
      { "type": "point", "name": "C", "coords": [4, 4], "visible": false },
      { "type": "point", "name": "D", "coords": [0, 4], "visible": false },
      { "type": "polygon", "parents": ["A","B","C","D"], "fillColor": "none" },
      
      // Cara Trasera (Parcialmente oculta)
      { "type": "point", "name": "A2", "coords": [2, 2], "visible": false }, // Oculto
      { "type": "point", "name": "B2", "coords": [6, 2], "visible": false },
      { "type": "point", "name": "C2", "coords": [6, 6], "visible": false },
      { "type": "point", "name": "D2", "coords": [2, 6], "visible": false },
      
      // Aristas de Profundidad
      { "type": "segment", "parents": ["A", "A2"], "dash": 2 }, // Oculta
      { "type": "segment", "parents": ["B", "B2"] },
      { "type": "segment", "parents": ["C", "C2"] },
      { "type": "segment", "parents": ["D", "D2"] },
      
      // Completar fondo
      { "type": "segment", "parents": ["A2", "B2"], "dash": 2 }, // Oculta
      { "type": "segment", "parents": ["A2", "D2"], "dash": 2 }, // Oculta
      { "type": "segment", "parents": ["B2", "C2"] },
      { "type": "segment", "parents": ["C2", "D2"] }
    ]
  }
}
`;
