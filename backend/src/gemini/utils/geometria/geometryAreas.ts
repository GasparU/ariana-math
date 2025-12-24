export const AREA_RULES = `
### REGLAS PARA ÁREAS SOMBREADAS (POLÍGONOS Y CÍRCULOS):
1. **ESTRUCTURA DE DATOS:**
   - Usa "polygon" para triángulos, cuadrados, rectángulos.
   - Usa "circle" para círculos.
   - Usa "fillColor" para sombrear.
   - Usa "sector" para SEMICÍRCULOS o CUARTOS de círculo. [IMPORTANTE]

2. **LÓGICA DE VISUALIZACIÓN (Regiones y Huecos):**
   - **Región Sombreada:** Usa fillColor: "#FF6384" (Rosado), "#C9CBCF" (Gris) o "#FFCE56" (Amarillo).
   - **Huecos (Parte blanca):** Si hay una figura dentro de otra (ej: corona circular), dibuja primero la figura GRANDE con color, y luego la PEQUEÑA encima con fillColor: "#FFFFFF" (Blanco) y fillOpacity: 1.0.

3. **COORDENADAS (Normalización Visual):**
   - Centra la figura principal en (0,0).
   - Mantén el canvas entre X=[-6, 6] y Y=[-4, 4].

### RECETARIO DE FIGURAS (Sigue estos patrones JSON):

**CASO A: CUADRADO O RECTÁNGULO (Centrado en 0,0)**
Calcula las coordenadas basándote en el Ancho (W) y Alto (H).
- Puntos: A(-W/2, -H/2), B(-W/2, H/2), C(W/2, H/2), D(W/2, -H/2).
EJEMPLO JSON:
{
  "graph_data": {
    "elements": [
      { "type": "point", "name": "A", "coords": [-4, -2.5], "visible": false },
      { "type": "point", "name": "B", "coords": [-4, 2.5], "visible": false },
      { "type": "point", "name": "C", "coords": [4, 2.5], "visible": false },
      { "type": "point", "name": "D", "coords": [4, -2.5], "visible": false },
      { "type": "polygon", "parents": ["A", "B", "C", "D"], "color": "black", "fillColor": "#e0f2fe", "fillOpacity": 0.5 },
      { "type": "text", "coords": [0, -3], "text": "Base: 8 cm" },
      { "type": "text", "coords": [-4.5, 0], "text": "Altura: 5 cm" }
    ]
  }
}

**CASO B: CORONA CIRCULAR (Dona)**
Dibuja DOS círculos concéntricos en (0,0).
1. Círculo Grande: Color sólido.
2. Círculo Pequeño: Color BLANCO (#FFFFFF) para hacer el agujero.
EJEMPLO JSON:
{
  "graph_data": {
    "elements": [
      { "type": "point", "name": "O", "coords": [0,0], "visible": true, "label": "O" },
      { "type": "circle", "parents": ["O", 4], "color": "black", "fillColor": "#9966FF", "fillOpacity": 1.0 }, // Grande
      { "type": "circle", "parents": ["O", 2], "color": "black", "fillColor": "#FFFFFF", "fillOpacity": 1.0 }, // Pequeño (Hueco)
      { "type": "text", "coords": [2, 0.5], "text": "r" },
      { "type": "text", "coords": [4, 0.5], "text": "R" }
    ]
  }
}

**CASO C: POLÍGONOS EN "L" O IRREGULARES**
Define cada vértice explícitamente.
EJEMPLO JSON:
{
  "graph_data": {
    "elements": [
      { "type": "point", "name": "P1", "coords": [-2, -2], "visible": false },
      { "type": "point", "name": "P2", "coords": [-2, 4], "visible": false },
      { "type": "point", "name": "P3", "coords": [2, 4], "visible": false },
      { "type": "point", "name": "P4", "coords": [2, 0], "visible": false },
      { "type": "point", "name": "P5", "coords": [4, 0], "visible": false },
      { "type": "point", "name": "P6", "coords": [4, -2], "visible": false },
      { "type": "polygon", "parents": ["P1", "P2", "P3", "P4", "P5", "P6"], "fillColor": "#FFCE56" }
    ]
  }
}

**CASO D: SEMICÍRCULOS Y SECTORES (NUEVO - IMPRESCINDIBLE)**
Si piden "semicírculo", "sector circular" o "cuarto de círculo", NO uses 'circle'.
Usa "type": "sector".
Parents: [Centro, Punto_Inicio, Punto_Fin]. (Orden Antihorario).
EJEMPLO JSON (Semicírculo superior sobre un cuadrado):
{
  "graph_data": {
    "elements": [
      { "type": "point", "name": "CEN", "coords": [0, 0], "visible": false }, // Centro
      { "type": "point", "name": "P1", "coords": [4, 0], "visible": false },   // Derecha
      { "type": "point", "name": "P2", "coords": [-4, 0], "visible": false },  // Izquierda
      { "type": "sector", "parents": ["CEN", "P1", "P2"], "fillColor": "#FF6384", "fillOpacity": 0.5 },
      // Dibuja el radio o línea de base si es necesario
      { "type": "segment", "parents": ["P1", "P2"], "color": "black" }
    ]
  }
}

**CASO E: TRIÁNGULO DENTRO DE FIGURA (Altura Media)**
Si el problema dice "vértice en el punto medio" o "a mitad de altura":
- NO dibujes el vértice en el borde superior.
- Calcula la coordenada Y real. (Ej: Si Altura Total=6, el medio es Y=3, no Y=6).
EJEMPLO JSON (Triángulo inscrito a mitad de altura):
{
  "graph_data": {
    "elements": [
      { "type": "point", "name": "A", "coords": [-4, -2], "visible": false },
      { "type": "point", "name": "B", "coords": [4, -2], "visible": false },
      { "type": "point", "name": "M", "coords": [0, 1], "visible": true, "label": "M" }, // Y=1 es la mitad si el tope es 4
      { "type": "polygon", "parents": ["A", "B", "M"], "fillColor": "#36A2EB", "fillOpacity": 0.5 }
    ]
  }
}
`;
