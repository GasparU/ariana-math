// angles.js
export const renderAngle = (board, el, createdObjects) => {
  if (!el.parents || el.parents.length < 3) return null;
  // 1. DEFINIR LA FUNCIÓN AUXILIAR (Faltaba esto)
  const resolvePoint = (p) => {
    if (!p) return null; // Si p es null/undefined, salimos rápido
    if (typeof p === "string") return createdObjects[p];

    // Validamos que sea un array con números reales antes de crear el punto
    if (Array.isArray(p) && p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1])) {
      return board.create("point", p, { visible: false, fixed: true });
    }
    return p; // Devuelve el objeto si ya es un punt
  };

  // 2. Resolver los 3 puntos padres
  const p1 = resolvePoint(el.parents[0]);
  const vertex = resolvePoint(el.parents[1]);
  const p3 = resolvePoint(el.parents[2]);

  if (!p1 || !vertex || !p3) return null;
  // 2. Lógica Anti-Reflex (Garantiza el ángulo menor)
  let parents = [p1, vertex, p3];

  const x1 = p1.X(),
    y1 = p1.Y();
  const xv = vertex.X(),
    yv = vertex.Y();
  const x3 = p3.X(),
    y3 = p3.Y();

  const ang1 = Math.atan2(y1 - yv, x1 - xv);
  const ang3 = Math.atan2(y3 - yv, x3 - xv);

  let diff = ang3 - ang1;
  while (diff < 0) diff += 2 * Math.PI;

  if (diff > Math.PI) {
    parents = [p3, vertex, p1];
  }

  // 3. Estilos
  let finalFillColor = el.fillColor || "#FF6384";
  let finalFillOpacity = el.fillOpacity;
  // let angleType = "angle";

  const angleValue = el.value || 0;
  const isRightAngle = el.is_right_angle || Math.abs(angleValue - 90) < 0.1;
  let jsxAttributeType = "sector";

  if (isRightAngle) {
    jsxAttributeType = "square"; // Atributo especial de JSXGraph para ángulos rectos
    finalFillOpacity = 0;
  }


  if (finalFillOpacity === undefined) finalFillOpacity = 0;
  if (el.fillColor === "none") {
    finalFillColor = "none";
    finalFillOpacity = 0;
  }




  return board.create("angle", parents, {
    type: jsxAttributeType,
    name: el.text || el.label || "",
    radius: el.radius || 0.5, // Radio reducido para que no se vea gigante

    fillColor: finalFillColor,
    fillOpacity: finalFillOpacity,
    strokeColor: el.strokeColor || el.color || "#FF6384",
    strokeWidth: el.strokeWidth || 2,

    fixed: true,
    withLabel: true,
    label: {
      autoPosition: true,
      offset: [0, 10],
      anchorX: "middle",
      anchorY: "middle",
      fontSize: 14,
      color: "black",
      cssStyle:
        "font-weight: bold; background-color: rgba(255,255,255,0.7); padding: 1px; border-radius: 3px;", // Fondo blanco semitransparente para que se lea si cruza línea
    },
  });
};
