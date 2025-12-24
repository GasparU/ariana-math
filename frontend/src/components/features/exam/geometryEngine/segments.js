import { STYLES } from "./baseRenderer";

export const renderSegment = (board, el, createdObjects) => {
  if (!el.parents || el.parents.length < 2) {
    console.warn("Segmento inválido ignorado (Datos IA corruptos):", el);
    return;
  }
  let p1, p2;

  // Caso A: Referencia por nombre ("A", "B")
  if (typeof el.parents[0] === "string") {
    p1 = createdObjects[el.parents[0]];
    p2 = createdObjects[el.parents[1]];
  }
  // Caso B: Coordenadas directas (Usado para cotas volantes o líneas auxiliares)
  else if (Array.isArray(el.parents[0])) {
    p1 = board.create("point", el.parents[0], { visible: false, fixed: true });
    p2 = board.create("point", el.parents[1], { visible: false, fixed: true });
  }

  if (p1 && p2) {
    const isMeasure = STYLES.isDimensionColor(el.color);

    // Cálculo Geométrico para detectar "Tope Vertical" vs "Línea Horizontal"
    // Esto es vital para tus cotas de arquitectura
    const x1 = p1.X();
    const y1 = p1.Y();
    const x2 = p2.X();
    const y2 = p2.Y();

    // Es vertical si la diferencia en X es casi cero y hay diferencia en Y
    const isVerticalStopper =
      Math.abs(x1 - x2) < 0.1 && Math.abs(y1 - y2) > 0.1;

    let finalDash = 0; // 0 = Sólido
    let finalWidth = 2;
    let finalColor = el.color || STYLES.MAIN_LINE;

    if (isMeasure) {
      el.firstArrow = false;
      el.lastArrow = false;

      if (isVerticalStopper) {
        // ES EL TOPE (|): Sólido
        finalDash = 0;
        finalWidth = 2;
      } else {
        // ES LA LÍNEA DE MEDIDA (---): Punteada
        finalDash = 2;
        finalWidth = 1;
      }
    } else {
      // LÍNEA BASE
      if (!el.color) finalColor = STYLES.MAIN_LINE;
      finalWidth = 2;
    }

    const jsxType = (el.type || "segment").toLowerCase();

    let labelText = el.name || "";
    if (!labelText && typeof el.label === "string") {
      labelText = el.label;
    }

    const labelSettings = typeof el.label === "object" ? el.label : {};

    board.create(jsxType, [p1, p2], {
      strokeColor: finalColor,
      strokeWidth: finalWidth,
      dash: finalDash,
      firstArrow: el.firstArrow || false,
      lastArrow: el.lastArrow || false,
      straightFirst: jsxType === "line",
      straightLast: jsxType === "line",
      layer: isMeasure ? 2 : 1,
      fixed: true,
      withLabel: !!labelText,
      name: labelText,
      label: {
        offset: [15, 0],
        anchorX: "left",
        anchorY: "middle",
        position: "last",
        ...labelSettings,
      },
    });
  }
};
